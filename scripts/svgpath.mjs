// Minimal SVG path parser -> contours of absolute line / cubic segments.
export function tokenize(d) {
  return d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
}
export function parse(d) {
  const t = tokenize(d); let i = 0, cmd = null;
  const contours = []; let cur = null, x = 0, y = 0, sx = 0, sy = 0, lc = null;
  const num = () => parseFloat(t[i++]);
  while (i < t.length) {
    if (/^[A-Za-z]$/.test(t[i])) cmd = t[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    if (C === "Z") {
      if (cur) { cur.closed = true; if (Math.hypot(x - sx, y - sy) > 1e-9) cur.segs.push({ t: "L", p0: [x, y], p1: [sx, sy] }); }
      x = sx; y = sy; lc = null; cur = null; continue;
    }
    if (C === "M") {
      x = sx = num() + (rel ? x : 0); y = sy = num() + (rel ? y : 0);
      cur = { segs: [], closed: false }; contours.push(cur); cmd = rel ? "l" : "L"; lc = null; continue;
    }
    if (!cur) { cur = { segs: [], closed: false }; contours.push(cur); sx = x; sy = y; }
    if (C === "L") { const nx = num() + (rel ? x : 0), ny = num() + (rel ? y : 0); cur.segs.push({ t: "L", p0: [x, y], p1: [nx, ny] }); x = nx; y = ny; lc = null; }
    else if (C === "H") { const nx = num() + (rel ? x : 0); cur.segs.push({ t: "L", p0: [x, y], p1: [nx, y] }); x = nx; lc = null; }
    else if (C === "V") { const ny = num() + (rel ? y : 0); cur.segs.push({ t: "L", p0: [x, y], p1: [x, ny] }); y = ny; lc = null; }
    else if (C === "C") {
      const a = [num() + (rel ? x : 0), num() + (rel ? y : 0)], b = [num() + (rel ? x : 0), num() + (rel ? y : 0)], p = [num() + (rel ? x : 0), num() + (rel ? y : 0)];
      cur.segs.push({ t: "C", p0: [x, y], c1: a, c2: b, p1: p }); lc = b; x = p[0]; y = p[1];
    } else if (C === "S") {
      const a = lc ? [2 * x - lc[0], 2 * y - lc[1]] : [x, y];
      const b = [num() + (rel ? x : 0), num() + (rel ? y : 0)], p = [num() + (rel ? x : 0), num() + (rel ? y : 0)];
      cur.segs.push({ t: "C", p0: [x, y], c1: a, c2: b, p1: p }); lc = b; x = p[0]; y = p[1];
    } else throw new Error("unsupported path command " + cmd);
  }
  return contours;
}
export function polygonToD(points) {
  const n = points.trim().split(/[\s,]+/).map(Number); let d = "";
  for (let k = 0; k < n.length; k += 2) d += (k ? "L" : "M") + n[k] + "," + n[k + 1];
  return d + "Z";
}
const f = (v) => { const s = (Math.round(v * 100) / 100).toFixed(2).replace(/\.?0+$/, ""); return s === "-0" ? "0" : s; };
export function serialize(contours) {
  let d = "";
  for (const c of contours) {
    if (!c.segs.length) continue;
    d += `M${f(c.segs[0].p0[0])},${f(c.segs[0].p0[1])}`;
    c.segs.forEach((s, k) => {
      if (c.closed && k === c.segs.length - 1 && s.t === "L") return;   // Z closes it
      if (s.t === "L") d += `L${f(s.p1[0])},${f(s.p1[1])}`;
      else d += `C${f(s.c1[0])},${f(s.c1[1])},${f(s.c2[0])},${f(s.c2[1])},${f(s.p1[0])},${f(s.p1[1])}`;
    });
    if (c.closed) d += "Z";
  }
  return d;
}
