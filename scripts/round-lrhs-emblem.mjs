// Round the corners of the LR emblem, identically in every file that carries it.
//
// The LR is drawn as stacked outlines: a black silhouette, a white ring and the
// green letter, each an offset of the one inside it. Each layer's radius grows
// with its offset from the green core: R_CORE + K x offset on outside corners,
// R_CORE - K x offset on inside corners (never below R_MIN). K = 1 is fully
// concentric (an offset path with round joins: outline widths stay exactly
// even); K < 1 keeps the outside subtle, with the outlines a touch heavier at
// the corners — still less than the square originals, where a mitred corner
// is 41% heavier than the straight.
//
// Current settings (Oct 2026, "subtle, like Apple's"): R_CORE 10, K 0.4,
// R_MIN 6 — about 30 on the outer silhouette of the 1944-wide Emblem.
//
// The radii are worked out once on the full-colour Emblem, where every layer is
// present, then matched by position and edge direction in each file (allowing
// for the band files' scale), so all seven files get exactly the same corners.
// Horse, shako and music artwork are never touched. The L's foot, where it
// tucks under the R, is a junction rather than a corner and stays square.
//
// Run:  OUT="C:/Users/B M H/Downloads/SVG" node scripts/round-lrhs-emblem.mjs
//       SRC defaults to the square-cornered originals; R_CORE / K / R_MIN tune it.
import fs from "node:fs";
import path from "node:path";
import { parse, polygonToD, serialize } from "./svgpath.mjs";

const R_CORE = +(process.env.R_CORE || 10);   // radius on the green core, canonical units
const K = +(process.env.K || 0.4);            // how much each outer layer's radius grows with its offset
const R_MIN = +(process.env.R_MIN || 6);      // floor for inside corners on the outer layers
const LONG = 20, MICRO_RUN = 16, TOL = 3, LOOSE = +(process.env.LOOSE || 7);

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k], dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const len = (a) => Math.hypot(a[0], a[1]), unit = (a) => mul(a, 1 / len(a));
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];

function straightCubic(s) {
  const ch = sub(s.p1, s.p0), L = len(ch); if (L < 1e-6) return true;
  const n = [-ch[1] / L, ch[0] / L];
  for (const c of [s.c1, s.c2]) {
    if (Math.abs(dot(sub(c, s.p0), n)) > Math.max(0.3, 0.008 * L)) return false;
    const tt = dot(sub(c, s.p0), ch) / (L * L); if (tt < -0.02 || tt > 1.02) return false;
  }
  return true;
}
const segLen = (s) => len(sub(s.p1, s.p0));

function simplify(c) {
  return simplifyMerge(simplifyConvert(c));
}
function simplifyConvert(c) {
  let segs = c.segs.map((s) => (s.t === "C" && straightCubic(s) ? { t: "L", p0: s.p0, p1: s.p1 } : { ...s }));
  segs = segs.filter((s) => segLen(s) > 0.02 || s.t === "C");
  for (let k = 0; k < segs.length; k++) { const nx = segs[(k + 1) % segs.length]; if (c.closed || k < segs.length - 1) nx.p0 = segs[k].p1; }
  return { segs, closed: c.closed };
}
function simplifyMerge(c) {
  const segs = c.segs.filter((s) => segLen(s) > 0.02 || s.t === "C");
  const out = [];
  const coll = (a, b) => dot(unit(sub(a.p1, a.p0)), unit(sub(b.p1, b.p0))) > Math.cos((0.35 * Math.PI) / 180);
  for (const s of segs) {
    const prev = out[out.length - 1];
    if (prev && prev.t === "L" && s.t === "L" && coll(prev, s)) { prev.p1 = s.p1; continue; }
    out.push(s);
  }
  if (c.closed && out.length > 2) {
    const a = out[out.length - 1], b = out[0];
    if (a.t === "L" && b.t === "L" && coll(a, b)) { b.p0 = a.p0; out.pop(); }
  }
  return { segs: out, closed: c.closed };
}

function healSlits(c) {
  if (!c.closed) return [c];
  const S = c.segs;
  for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) {
    const a = S[i], b = S[j]; if (a.t !== "L" || b.t !== "L") continue;
    const da = unit(sub(a.p1, a.p0)), db = unit(sub(b.p1, b.p0));
    if (dot(da, db) > -0.9999) continue;
    if (Math.abs(cross(da, sub(b.p0, a.p0))) > 0.3 || Math.abs(cross(da, sub(b.p1, a.p0))) > 0.3) continue;
    const ta = (q) => dot(sub(q, a.p0), da), La = len(sub(a.p1, a.p0));
    const lo = Math.max(0, Math.min(ta(b.p0), ta(b.p1))), hi = Math.min(La, Math.max(ta(b.p0), ta(b.p1)));
    if (hi - lo < 2) continue;
    const P = add(a.p0, mul(da, lo)), Q = add(a.p0, mul(da, hi));
    const piece = (p0, p1) => (len(sub(p1, p0)) > 0.01 ? [{ t: "L", p0, p1 }] : []);
    const aBefore = piece(a.p0, P), aAfter = piece(Q, a.p1);
    const tb = (q) => dot(sub(q, b.p0), db);
    const Qb = add(b.p0, mul(db, Math.max(0, tb(Q)))), Pb = add(b.p0, mul(db, Math.min(len(sub(b.p1, b.p0)), tb(P))));
    const bBefore = piece(b.p0, Qb), bAfter = piece(Pb, b.p1);
    const loop1 = [...aAfter, ...S.slice(i + 1, j), ...bBefore];
    const loop2 = [...bAfter, ...S.slice(j + 1), ...S.slice(0, i), ...aBefore];
    const out = [];
    for (const L of [loop1, loop2]) if (L.length >= 2) {
      for (let k = 0; k < L.length; k++) L[(k + 1) % L.length].p0 = L[k].p1;
      out.push(...healSlits(simplifyMerge({ segs: L, closed: true })));
    }
    return out;
  }
  return [c];
}

function lineIntersect(p, u, q, w) {
  const den = cross(u, w); if (Math.abs(den) < 1e-9) return null;
  const tt = cross(sub(q, p), w) / den; return add(p, mul(u, tt));
}

// Corners of a closed, simplified contour: between two long lines, directly
// or across a short run of tiny segments (a traced chamfer at the corner).
function corners(c, sc = 1) {
  const S = c.segs, n = S.length, out = [];
  if (!c.closed || n < 3) return out;
  const isLong = (k) => S[k].t === "L" && segLen(S[k]) >= LONG * sc;
  for (let k = 0; k < n; k++) {
    if (!isLong(k)) continue;
    let j = (k + 1) % n, run = [], runLen = 0;
    while (!isLong(j) && run.length < 6) { run.push(j); runLen += segLen(S[j]); j = (j + 1) % n; if (j === k) break; }
    if (!isLong(j) || j === k) continue;
    const u = unit(sub(S[k].p1, S[k].p0)), w = unit(sub(S[j].p1, S[j].p0));
    const alpha = Math.atan2(cross(u, w), dot(u, w));
    if (run.length === 0) {
      if (Math.abs(alpha) < (6 * Math.PI) / 180) continue;
      out.push({ V: S[k].p1, u, w, alpha, a: k, b: j, run });
    } else {
      if (runLen > MICRO_RUN * sc || Math.abs(alpha) < (25 * Math.PI) / 180) continue;
      const X = lineIntersect(S[k].p1, u, S[j].p0, w);
      if (!X || len(sub(X, S[k].p1)) > MICRO_RUN * sc || len(sub(X, S[j].p0)) > MICRO_RUN * sc) continue;
      out.push({ V: X, u, w, alpha, a: k, b: j, run });
    }
  }
  return out;
}

function fillet(c, cs) {
  const S = c.segs, byA = new Map(), byB = new Map();
  for (const k of cs) { k.t = k.rho > 0 ? k.rho * Math.tan(Math.abs(k.alpha) / 2) : 0; byA.set(k.a, k); byB.set(k.b, k); }
  for (let e = 0; e < S.length; e++) {
    const end = byA.get(e), start = byB.get(e); if (!end && !start) continue;
    const p0 = start ? start.V : S[e].p0, p1 = end ? end.V : S[e].p1, L = len(sub(p1, p0));
    const need = (end ? end.t : 0) + (start ? start.t : 0);
    if (need > 0.96 * L) { const k = (0.96 * L) / need; if (end) end.t *= k; if (start) start.t *= k; }
  }
  for (const k of cs) k.rhoUsed = k.t / Math.tan(Math.abs(k.alpha) / 2);
  const skip = new Set(cs.flatMap((k) => (k.t > 0 ? k.run : [])));
  const segs = [];
  let s0 = 0; while (skip.has(s0)) s0++;
  for (let q = 0; q < S.length; q++) {
    const e = (s0 + q) % S.length; if (skip.has(e)) continue;
    const g = S[e], end = byA.get(e), start = byB.get(e);
    if (g.t === "L") {
      const p0 = start && start.t > 0 ? add(start.V, mul(start.w, start.t)) : start && start.run.length === 0 ? start.V : g.p0;
      const p1 = end && end.t > 0 ? sub(end.V, mul(end.u, end.t)) : end && end.run.length === 0 ? end.V : g.p1;
      segs.push({ t: "L", p0, p1 });
    } else segs.push({ ...g });
    if (end) {
      if (end.t > 0) {
        const T1 = sub(end.V, mul(end.u, end.t)), T2 = add(end.V, mul(end.w, end.t));
        const kk = (4 / 3) * Math.tan(Math.abs(end.alpha) / 4) * end.rhoUsed;
        segs.push({ t: "C", p0: T1, c1: add(T1, mul(end.u, kk)), c2: sub(T2, mul(end.w, kk)), p1: T2 });
      } else if (end.run.length) {
        for (const r of end.run) segs.push({ ...S[r] });
      }
    }
  }
  for (let k = 0; k < segs.length; k++) segs[(k + 1) % segs.length].p0 = segs[k].p1;
  return { segs, closed: true };
}

// ---------- canonical radii, from the full-colour Emblem ----------
const SRC = process.env.SRC || "C:/Users/B M H/Downloads/SVG/Square corners (originals)";
const els = (svg) => [...svg.matchAll(/<(path|polygon)\b([^>]*?)\/?>/g)].map((m) => {
  const d = m[1] === "polygon" ? polygonToD(m[2].match(/points="([^"]+)"/)[1]) : (m[2].match(/\sd="([^"]+)"/) || [])[1];
  return { tag: m[1], attrs: m[2], full: m[0], d };
});
const canonSvg = fs.readFileSync(path.join(SRC, "LRHS Emblem.svg"), "utf8");
const CANON_LETTER = [0, 1, 2, 3, 5, 6, 7, 8];
const canonEls = els(canonSvg);
const canonCorners = [];
const JUNCTION = (k, el) => el !== 0 && Math.abs(k.V[0] - 947) < 3 && k.V[1] > 935 && k.V[1] < 1240;   // L foot tucked under the R
for (const i of CANON_LETTER) for (const c of parse(canonEls[i].d).map(simplify).flatMap(healSlits)) for (const k of corners(c)) if (!JUNCTION(k, i)) canonCorners.push({ ...k, el: i });

const bez = (s, t) => { const mt = 1 - t; return [0, 1].map((q) => mt*mt*mt*s.p0[q] + 3*mt*mt*t*s.c1[q] + 3*mt*t*t*s.c2[q] + t*t*t*s.p1[q]); };
const sil = parse(canonEls[0].d).map((c) => { const pts = []; for (const s of c.segs) { if (s.t === "L") pts.push(s.p0); else for (let q = 0; q < 8; q++) pts.push(bez(s, q / 8)); } return pts; });
const inside = (p) => { let c = false; for (const poly of sil) for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c; } return c; };

const par = (a, b) => Math.abs(dot(a, b)) > Math.cos((1.5 * Math.PI) / 180);
const bis = (k) => unit(sub(k.w, k.u));
const parent = canonCorners.map((_, i) => i);
const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
for (let i = 0; i < canonCorners.length; i++) for (let j = i + 1; j < canonCorners.length; j++) {
  const A = canonCorners[i], B = canonCorners[j];
  const same = par(A.u, B.u) && par(A.w, B.w) && dot(A.u, B.u) > 0 && dot(A.w, B.w) > 0;
  const rev = par(A.u, B.w) && par(A.w, B.u) && dot(A.u, B.w) < 0 && dot(A.w, B.u) < 0;
  if (!same && !rev) continue;
  const n = bis(A), d = sub(B.V, A.V);
  if (len(d) > 120 || Math.abs(cross(n, d)) > 3) continue;
  parent[find(i)] = find(j);
}
const clusters = new Map();
canonCorners.forEach((k, i) => { const r = find(i); if (!clusters.has(r)) clusters.set(r, []); clusters.get(r).push(k); });
for (const members of clusters.values()) {
  const n = bis(members[0]);
  const proj = members.map((k) => dot(k.V, n));
  const hi = members[proj.indexOf(Math.max(...proj))];
  const convex = inside(add(hi.V, mul(n, 4)));
  const core = convex ? hi : members[proj.indexOf(Math.min(...proj))];
  const P = add(core.V, mul(n, R_CORE / Math.abs(Math.cos(core.alpha / 2))));
  for (const k of members) {
    const s = dot(sub(P, k.V), bis(k));
    const offset = s * Math.abs(Math.cos(k.alpha / 2)) - R_CORE;     // +d outside corners, -d inside
    k.rho = Math.max(R_CORE + K * offset, R_MIN);
    k.convex = convex; k.size = members.length;
  }
}

// ---------- apply to every file ----------
function transformFor(svgEls) {
  for (const e of svgEls) {
    if (!e.d) continue; const cs = parse(e.d); if (cs.length !== 2) continue;
    let xs = [], ys = [], L = 0; for (const c of cs) for (const g of c.segs) { xs.push(g.p0[0]); ys.push(g.p0[1]); if (g.t === "L") L++; }
    const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    if (L >= 30 && Math.abs(w / h - 1944.33 / 1873.27) < 0.01) return { s: w / 1944.33, tx: Math.min(...xs), ty: Math.min(...ys) };
  }
  return null;
}
const FILES = (process.env.FILES || "LRHS Emblem.svg|LRHS Emblem 2.svg|LRHS Emblem 3.svg|LRHS Emblem Mono.svg|LRHS Emblem Mono 2.svg|LRHS Band Emblem.svg|LRHS Band.svg").split("|");
const OUT = process.env.OUT;
if (!OUT) { console.error("set OUT to the folder the rounded files should go to"); process.exit(1); }
if (path.resolve(OUT) === path.resolve(SRC)) { console.error("OUT must differ from SRC — rounding a rounded file rounds it twice"); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });
const report = [];
for (const file of FILES) {
  let svg = fs.readFileSync(path.join(SRC, file), "utf8");
  const E = els(svg);
  const T = transformFor(E) || { s: 1, tx: 0, ty: 0 };
  const toC = (p) => [(p[0] - T.tx) / T.s, (p[1] - T.ty) / T.s];
  let matched = 0; const unmatched = [], loose = []; const used = new Set();
  for (const e of E) {
    if (!e.d) continue;
    const cs = parse(e.d).map(simplify).flatMap(healSlits);
    const healed = cs.length !== parse(e.d).length;
    let touched = false;
    const outC = cs.map((c) => {
      const ks = corners(c, T.s);
      for (const k of ks) {
        const Vc = toC(k.V);
        let m = null, md = Infinity;
        const dirOk = (q, tol) => { const p = (a, b) => Math.abs(dot(a, b)) > Math.cos((tol * Math.PI) / 180); return (p(q.u, k.u) && p(q.w, k.w)) || (p(q.u, k.w) && p(q.w, k.u)); };
        for (const q of canonCorners) { if (!dirOk(q, 1.5)) continue; const dd = len(sub(q.V, Vc)); if (dd < md) { md = dd; m = q; } }
        if (!m || md >= TOL) for (const q of canonCorners) { if (!dirOk(q, 3)) continue; const dd = len(sub(q.V, Vc)); if (dd < md) { md = dd; m = q; } }
        if (m && md >= TOL && md < LOOSE) loose.push(`${Vc.map((v) => v.toFixed(0)).join(",")}~${md.toFixed(1)}`);
        if (m && md >= LOOSE) m = null;
        if (m) { k.rho = m.rho * T.s; matched++; used.add(m); } else { k.rho = 0; if (Math.abs(k.alpha) > 0.5 && Vc[0] > -60 && Vc[0] < 2000 && Vc[1] > -60 && Vc[1] < 1930) unmatched.push(`${Vc.map((v) => v.toFixed(0)).join(",")}@${(k.alpha * 180 / Math.PI).toFixed(0)}`); }
      }
      if (!ks.some((k) => k.rho > 0)) return null;
      touched = true; return fillet(c, ks);
    });
    if (!touched) continue;
    const orig = parse(e.d);
    const d = serialize(outC.map((c, i) => c || (healed ? cs[i] : orig[i])));
    const newEl = e.tag === "polygon" ? `<path${e.attrs.replace(/\spoints="[^"]+"/, ` d="${d}"`)}/>` : e.full.replace(e.d, d);
    svg = svg.replace(e.full, newEl);
  }
  fs.writeFileSync(path.join(OUT, file), svg);
  if (process.env.MISSING) console.log(file, 'canonical corners not found:', canonCorners.filter((q) => !used.has(q) && ![...used].some((u) => len(sub(u.V, q.V)) < 3.5 && par(u.u, q.u) + par(u.w, q.w) + par(u.u, q.w) >= 2)).map((q) => `el${q.el}@${q.V.map((v) => v.toFixed(1)).join(',')}`).join(' '));
  report.push(`${file.padEnd(24)} scale ${T.s.toFixed(4)}  filleted ${String(matched).padStart(3)}  loose ${loose.length}${loose.length ? " [" + loose.join(" ") + "]" : ""}  sharp in letter area ${unmatched.length}${unmatched.length ? "  [" + unmatched.join(" ") + "]" : ""}`);
}
const conv = canonCorners.filter((k) => k.convex).length;
console.log(`canonical corners ${canonCorners.length} (${conv} convex) in ${clusters.size} clusters; R_CORE ${R_CORE} K ${K} R_MIN ${R_MIN}`);
console.log(report.join("\n"));
