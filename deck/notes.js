/* Speaker notes, read out of the presenter script.

   assets/script/presenter-script.html is the one place the words live: the
   printable script, the PDF's back pages and the deck's speaker notes all come
   from it, so editing a line there changes all three on the next build.

   Each beat in the script names the slides it covers ("7", "11–15"). The first
   slide of a beat carries the whole beat; the slides after it carry a short
   "same beat" line, so Presenter View never shows an empty box mid-section.
   The last slide also carries the Q&A, the quiet-room fallback and the footer,
   because that is the slide left up while questions are taken.

   Returns, per slide, a list of paragraphs: { kind: "head" | "say" | "do" | "sub", text }. */
const fs = require("fs");
const path = require("path");

const SCRIPT = path.join(__dirname, "..", "assets", "script", "presenter-script.html");

const ENT = { mdash: "—", ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", amp: "&", nbsp: " ", middot: "·", times: "×" };
const text = (html) => html
  .replace(/<[^>]+>/g, "")
  .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === "#"
    ? String.fromCodePoint(parseInt(e.slice(e[1] === "x" ? 2 : 1), e[1] === "x" ? 16 : 10))
    : ENT[e] ?? m)
  .replace(/\s+/g, " ")
  .trim();

function beats(html) {
  const out = [];
  const re = /<div class="beat( hold)?"[^>]*>([\s\S]*?)\n    <\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    const body = m[2];
    const no = body.match(/<span class="no">([^<]+)<\/span>/);
    if (!no) continue;                                   // the quiet-room beat has no slide number
    const [a, b] = text(no[1]).split(/[–-]/).map(Number);
    out.push({
      from: a, to: b || a, hold: !!m[1],
      title: text(body.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)[1]),
      time: (body.match(/<span class="time">([^<]+)<\/span>/) || [, ""])[1],
      lines: [...body.matchAll(/<p class="(say|do)">([\s\S]*?)<\/p>/g)].map(([, kind, t]) => ({ kind, text: text(t) })),
    });
  }
  return out;
}

function tail(html) {
  const paras = [];
  const qa = html.match(/<h2 class="sec">What they'll ask<\/h2>([\s\S]*?)<\/section>/);
  if (qa) {
    paras.push({ kind: "head", text: "If they ask" });
    for (const [, q, a] of qa[1].matchAll(/<div class="q">\s*<p>([\s\S]*?)<\/p>\s*<p>([\s\S]*?)<\/p>/g)) {
      paras.push({ kind: "sub", text: text(q) }, { kind: "do", text: text(a) });
    }
  }
  const quiet = html.match(/<h2 class="sec">If the room goes quiet<\/h2>([\s\S]*?)<\/section>/);
  if (quiet) {
    paras.push({ kind: "head", text: "If the room goes quiet" });
    for (const [, kind, t] of quiet[1].matchAll(/<p class="(say|do)">([\s\S]*?)<\/p>/g)) paras.push({ kind, text: text(t) });
  }
  const foot = html.match(/<footer>([\s\S]*?)<\/footer>/);
  if (foot) paras.push({ kind: "head", text: "Before you leave the room" }, { kind: "do", text: text(foot[1]).replace(/^Before you leave the room:\s*/i, "") });
  return paras;
}

/** notes for every slide, 1-based list of paragraph arrays */
function speakerNotes(count, titles = []) {
  const html = fs.readFileSync(SCRIPT, "utf8");
  const notes = Array.from({ length: count }, () => []);
  for (const beat of beats(html)) {
    for (let n = beat.from; n <= beat.to && n <= count; n++) {
      const head = [`${n === beat.from ? beat.title : "Same beat: " + beat.title}`, beat.hold ? "HOLD" : "", n === beat.from ? beat.time : ""]
        .filter(Boolean).join("  ·  ");
      notes[n - 1].push({ kind: "head", text: head });
      if (n === beat.from) notes[n - 1].push(...beat.lines);
      else notes[n - 1].push({ kind: "do", text: `Still the beat that started on slide ${beat.from}${titles[n - 1] ? ` — this one is ${titles[n - 1].split(" — ")[0]}` : ""}. Keep it moving.` });
    }
  }
  notes[count - 1].push(...tail(html));
  return notes;
}

module.exports = { speakerNotes };
