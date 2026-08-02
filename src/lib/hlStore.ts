/**
 * Local vault for a visitor's own Half-Life files.
 *
 * The game data is never hosted and never uploaded — it's read off the
 * visitor's disk once and kept in their browser's IndexedDB, so the second
 * visit boots straight in instead of asking for the folder again.
 *
 * Files are held as Blobs rather than ArrayBuffers: the browser can keep a
 * Blob backed on disk instead of pinned in memory, which matters when the
 * set runs to roughly half a gigabyte.
 */
const DB = "bmh-halflife";
const STORE = "files";
const META = "meta";
const VERSION = 1;

export type HLMeta = { count: number; bytes: number; savedAt: number };

/* Things Xash3D has no use for: native GoldSrc binaries (we run the wasm
   builds), the menu videos, saved games and pad configs. ~32MB saved, and
   none of it is reachable by the engine anyway. */
const SKIP = /(\.so$|\.dll$|\.dylib$|\.avi$|^hw\/|^SAVE\/|^controller_configs\/)/i;

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META);
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

const done = (tx: IDBTransaction) =>
  new Promise<void>((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error);
  });

/** Relative path inside the chosen folder, with the folder's own name dropped. */
export function relPathOf(file: File): string {
  const full = file.webkitRelativePath || file.name;
  const cut = full.indexOf("/");
  return cut > 0 ? full.slice(cut + 1) : full;
}

export async function savedCopy(): Promise<HLMeta | null> {
  try {
    const db = await open();
    const meta = await new Promise<HLMeta | undefined>((res, rej) => {
      const r = db.transaction(META, "readonly").objectStore(META).get("info");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    db.close();
    return meta ?? null;
  } catch {
    return null;
  }
}

export async function saveCopy(
  files: File[],
  onProgress: (done: number, total: number) => void,
): Promise<HLMeta> {
  const keep = files.filter((f) => {
    const rel = relPathOf(f);
    return rel && !SKIP.test(rel);
  });

  // Ask the browser not to evict half a gigabyte the moment space is tight.
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* not fatal — it just means the copy may be evicted under pressure */
  }

  const db = await open();
  let bytes = 0;
  const CHUNK = 200;
  for (let i = 0; i < keep.length; i += CHUNK) {
    const slice = keep.slice(i, i + CHUNK);
    const tx = db.transaction(STORE, "readwrite");
    const os = tx.objectStore(STORE);
    for (const f of slice) {
      os.put(f.slice(), relPathOf(f)); // .slice() detaches a plain Blob
      bytes += f.size;
    }
    await done(tx);
    onProgress(Math.min(i + CHUNK, keep.length), keep.length);
  }

  const meta: HLMeta = { count: keep.length, bytes, savedAt: Date.now() };
  const tx = db.transaction(META, "readwrite");
  tx.objectStore(META).put(meta, "info");
  await done(tx);
  db.close();
  return meta;
}

type FSLike = {
  mkdir: (p: string) => void;
  writeFile: (p: string, d: Uint8Array) => void;
  analyzePath: (p: string) => { exists: boolean };
};

function mkdirp(FS: FSLike, dir: string) {
  let cur = "";
  for (const part of dir.split("/").filter(Boolean)) {
    cur += "/" + part;
    try {
      if (!FS.analyzePath(cur).exists) FS.mkdir(cur);
    } catch {
      /* already there */
    }
  }
}

/** Write one file into the engine's virtual filesystem under /valve. */
export async function mountOne(FS: FSLike, rel: string, blob: Blob) {
  const dest = `/valve/${rel}`;
  const slash = dest.lastIndexOf("/");
  if (slash > 0) mkdirp(FS, dest.slice(0, slash));
  FS.writeFile(dest, new Uint8Array(await blob.arrayBuffer()));
}

/** Stream the saved copy out of IndexedDB and into the engine. */
export async function mountSaved(
  FS: FSLike,
  onProgress: (done: number, total: number) => void,
): Promise<number> {
  const db = await open();
  const keys = await new Promise<IDBValidKey[]>((res, rej) => {
    const r = db.transaction(STORE, "readonly").objectStore(STORE).getAllKeys();
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });

  mkdirp(FS, "/valve");
  let n = 0;
  const CHUNK = 150;
  for (let i = 0; i < keys.length; i += CHUNK) {
    const slice = keys.slice(i, i + CHUNK);
    const os = db.transaction(STORE, "readonly").objectStore(STORE);
    const blobs = await Promise.all(
      slice.map(
        (k) =>
          new Promise<Blob>((res, rej) => {
            const r = os.get(k);
            r.onsuccess = () => res(r.result);
            r.onerror = () => rej(r.error);
          }),
      ),
    );
    for (let j = 0; j < slice.length; j++) {
      await mountOne(FS, String(slice[j]), blobs[j]);
      n++;
    }
    onProgress(n, keys.length);
  }
  db.close();
  return n;
}

export async function forgetCopy(): Promise<void> {
  const db = await open();
  const tx = db.transaction([STORE, META], "readwrite");
  tx.objectStore(STORE).clear();
  tx.objectStore(META).clear();
  await done(tx);
  db.close();
}
