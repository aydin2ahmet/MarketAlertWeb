/**
 * 24 saatlik zirve/dip sayfası (8. gün) yardımcıları. Hem sayfa üretiminde (ilk görünüm) hem tarayıcıda çalışır,
 * bu yüzden DOM kullanmaz; grafikleri SVG metni olarak üretir.
 * Kural sunucuyla aynı (Last24HourPriceExtremumCalculator): pencere, o dakikadan önceki 24 saatin mumlarıdır; mumun
 * en yükseği penceredeki en yüksekten büyükse yeni tepe, en düşüğü penceredeki en düşükten küçükse yeni dip.
 * Mesaj şablonları sunucunun gerçek çıktısıdır (PushNotificationTextBuilder, TelegramAlertMessageBuilder):
 * src/i18n/hl-messages.json. Grafik verileri sabit tohumla üretilen örnek serilerdir.
 */
import msgs from '../i18n/hl-messages.json';

export interface HlNum { dec: string; grp: string; indian: boolean; neg: string }
export interface HlLang {
  push: { h: string; l: string; hl: string; ll: string };
  tg: { h: string; l: string; hl: string; ll: string; button: string; market: string };
  ask: string; num: HlNum;
}
export interface Candle { o: number; h: number; l: number; c: number }
export const hlLang = (code: string) => (msgs as any)[code] as HlLang;
export const SHOT_VERSION = 'hl2';
export const shotSrc = (code: string, theme: 'light' | 'dark', k: string) => `/shots/${code}/${theme}/hl-${k}.webp?v=${SHOT_VERSION}`;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k) => (k in v ? String(v[k]) : m));

/** Sabit ondalıklı sayı; trim: .NET "#,0.##" gibi sondaki sıfırları atar. */
export function num(N: HlNum, v: number, dec: number, trim = false): string {
  let s = Math.abs(v).toFixed(dec);
  if (trim && dec) s = s.replace(/0+$/, '').replace(/\.$/, '');
  let [a, b] = s.split('.');
  a = N.indian ? a.replace(/(\d)(?=(\d\d)+\d$)/g, '$1' + N.grp) : a.replace(/\B(?=(\d{3})+(?!\d))/g, N.grp);
  return (v < 0 ? N.neg : '') + a + (b ? N.dec + b : '');
}
const PCT: Record<string, string> = { tr: '%{v}', de: '{v} %', fr: '{v} %', es: '{v} %', ru: '{v} %' };
export const pct = (code: string, N: HlNum, v: number) => fill(PCT[code] || '{v}%', { v: num(N, v, 1) });

/* ---------- örnek seriler ---------- */
function rnd(seed: number) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function build(keys: number[][], n: number, seed: number, noise: number): Candle[] {
  const r = rnd(seed), c: number[] = [];
  for (let i = 0; i < n; i++) {
    let k = 0; while (k < keys.length - 2 && keys[k + 1][0] <= i) k++;
    const [x0, y0] = keys[k], [x1, y1] = keys[k + 1]; const t = (i - x0) / (x1 - x0 || 1);
    c.push(y0 + (y1 - y0) * Math.max(0, Math.min(1, t)) + (r() - .5) * noise);
  }
  const out: Candle[] = []; let prev = c[0];
  for (let i = 0; i < n; i++) { const o = prev, cl = c[i]; out.push({ o, h: Math.max(o, cl) + r() * noise * .45, l: Math.min(o, cl) - r() * noise * .45, c: cl }); prev = cl; }
  return out;
}
/** İlk ekran: SOL, 96 × 30 dk. 20. mum eski zirve; 60 ve 78 çıtaya dokunur; 95 yeni çıtayı geçer. */
export const K = (() => {
  const cs = build([[0, 180], [10, 185], [20, 190], [28, 182], [40, 178], [48, 176], [56, 181], [60, 186.3], [66, 180], [72, 182.5], [78, 185.4], [82, 179], [88, 183], [94, 186], [95, 187.2]], 96, 7, 1.6);
  cs[60].h = 186.3; cs[78].h = 186.3; cs[20].h = 190.4;
  for (let i = 49; i < 95; i++) if (i !== 60 && i !== 78 && cs[i].h > 186.2) cs[i].h = 185.9;
  cs[95].h = 187.46; cs[95].c = 187.3;
  return cs;
})();
export const KWIN = 48, KLAST = 95;
/** Kaydırmalı grafik: BTC, 96 × 30 dk. */
export const P = build([[0, 69800], [12, 70900], [24, 70200], [36, 71400], [44, 70600], [52, 69700], [60, 70300], [66, 71200], [70, 70700], [76, 71800], [80, 71000], [86, 69900], [90, 69200], [95, 69900]], 96, 42, 260);
/** Bir gün: ETH, 192 × 15 dk (dün + bugün). */
export const D = build([[0, 2490], [30, 2512], [60, 2478], [95, 2500], [104, 2502], [106, 2518], [108, 2534], [110, 2526], [118, 2522], [120, 2538], [122, 2551], [126, 2542], [140, 2544], [150, 2530], [164, 2490], [170, 2478], [172, 2462], [174, 2452], [178, 2458], [191, 2470]], 192, 77, 5);
export const DWIN = 96, D0 = 96, DLAST = 191, CD = 4;

export const rollHi = (cs: Candle[], e: number, win: number) => Math.max(...cs.slice(Math.max(0, e - win), e).map(c => c.h));
export const rollLo = (cs: Candle[], e: number, win: number) => Math.min(...cs.slice(Math.max(0, e - win), e).map(c => c.l));

/* ---------- çizim yardımcıları ---------- */
const f1 = (v: number) => Math.round(v * 10) / 10;
interface Scale { x: (i: number) => number; y: (v: number) => number; st: number; mx: number; mn: number }
function scale(cs: Candle[], W: number, H: number, pad: number[], off = 0): Scale {
  const mx = Math.max(...cs.map(c => c.h)), mn = Math.min(...cs.map(c => c.l)); const st = (W - pad[1] - pad[3]) / cs.length;
  return { x: i => f1(pad[3] + st * (i - off + .5)), st, y: v => f1(pad[0] + (mx - v) / (mx - mn) * (H - pad[0] - pad[2])), mx, mn };
}
function candles(cs: Candle[], s: Scale, from: number, to: number, cls = 'fd'): string {
  let h = ''; const w = f1(Math.max(1.4, s.st * .62));
  for (let i = from; i <= to; i++) {
    const c = cs[i], x = s.x(i);
    h += `<g class="${c.c >= c.o ? 'cu' : 'cd'} ${cls}"><line x1="${x}" x2="${x}" y1="${s.y(c.h)}" y2="${s.y(c.l)}"/><rect x="${f1(x - w / 2)}" y="${s.y(Math.max(c.o, c.c))}" width="${w}" height="${f1(Math.max(1, Math.abs(s.y(c.o) - s.y(c.c))))}"/></g>`;
  }
  return h;
}
const defs = (id: string) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="ah"/></marker></defs>`;
/** Yazı genişliği tahmini (geniş yazılar için biraz fazla). */
const tw = (t: string, px = 11.5) => [...t].reduce((a, ch) => a + (/[　-鿿＀-￯]/.test(ch) ? px : /[ऀ-ॿ]/.test(ch) ? px * .62 : px * .58), 0);
interface Box { x0: number; x1: number; y0: number; y1: number }
const hit = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
/** Oklu açıklama: (x,y) noktasına, (tx,ty) yazısından kıvrık ok. */
function ann(mk: string, x: number, y: number, tx: number, ty: number, n: string, txt: string, anchor: 'start' | 'end', cls = ''): { svg: string; box: Box } {
  const mx = (x + tx) / 2, ex = x + (tx - x) * .06, ey = y + (ty - y) * .06, bx = anchor === 'end' ? tx - 8 : tx + 8, lx = anchor === 'end' ? tx - 22 : tx + 22;
  const w = tw(txt) + 30;
  const box = anchor === 'end' ? { x0: tx - w, x1: tx, y0: ty - 14, y1: ty + 5 } : { x0: tx, x1: tx + w, y0: ty - 14, y1: ty + 5 };
  return {
    svg: `<g class="hl-a ${cls}" data-a="${n}"><path class="ann" d="M${f1(tx)} ${f1(ty + (ty < y ? 6 : -14))} Q ${f1(mx)} ${f1(ty < y ? ty + 20 : ty - 30)} ${f1(ex)} ${f1(ey)}" marker-end="url(#${mk})"/><circle class="bd" cx="${f1(bx)}" cy="${ty - 4}" r="9"/><text class="bdt" x="${f1(bx)}" y="${ty}" text-anchor="middle">${n}</text><text class="annt" x="${f1(lx)}" y="${ty}" text-anchor="${anchor}">${esc(txt)}</text></g>`,
    box,
  };
}
function badge(x: number, y: number, n: number, dx: number, dy: number, cls = ''): string {
  const bx = f1(x + dx), by = f1(y + dy);
  return `<g class="hl-a ${cls}" data-a="${n}"><line class="ann" x1="${bx}" y1="${by}" x2="${x}" y2="${y}" stroke-dasharray="2 2"/><circle class="bd" cx="${bx}" cy="${by}" r="10"/><text class="bdt" x="${bx}" y="${by + 4}" text-anchor="middle">${n}</text></g>`;
}
const stair = (cs: Candle[], s: Scale, from: number, to: number, win: number, lo: boolean) => {
  let d = '';
  for (let i = from; i <= to; i++) { const v = s.y(lo ? rollLo(cs, i, win) : rollHi(cs, i, win)); d += `${i === from ? 'M' : 'L'}${f1(s.x(i) - s.st / 2)} ${v}L${f1(s.x(i) + s.st / 2)} ${v}`; }
  return d;
};

/* ---------- ilk ekran ---------- */
export interface KText { winK: string; annK: string[] }
/** E: son mum, stage: kaç açıklama görünür (1–5). */
export function heroSvg(W: number, H: number, E: number, stage: number, T: KText): string {
  const cs = K, narrow = W < 640, s = scale(cs, W, H, [narrow ? 40 : 84, narrow ? 12 : 16, 22, narrow ? 6 : 10]), st = E - KWIN + 1;
  let h = defs('hlak');
  h += `<rect class="win" x="${f1(s.x(st) - s.st / 2)}" y="${f1(s.y(s.mx) - 6)}" width="${f1(s.x(E) - s.x(st) + s.st)}" height="${f1(s.y(s.mn) - s.y(s.mx) + 12)}" rx="8"/>`;
  h += `<text class="wl" x="${f1((s.x(st) + s.x(E)) / 2)}" y="${f1(s.y(s.mn) + 18)}" text-anchor="middle">⟵ ${esc(T.winK)} ⟶</text>`;
  h += candles(cs, s, 0, E);
  h += `<path class="stair h" d="${stair(cs, s, KWIN, E, KWIN, false)}"/>`;
  const hiNow = rollHi(cs, E, KWIN);
  if (E >= 78) h += `<circle class="touch" cx="${s.x(78)}" cy="${s.y(cs[78].h)}" r="5"/>`;
  if (E === KLAST) h += `<circle class="ring h" cx="${s.x(95)}" cy="${s.y(cs[95].h)}" r="6"/><circle class="pz h" cx="${s.x(95)}" cy="${s.y(cs[95].h)}" r="6"/>`;
  const B = () => [badge(f1(s.x(st) + 4), f1(s.y(s.mx) + 4), 1, 10, 14), badge(s.x(Math.min(E, 84)), s.y(rollHi(cs, Math.min(E, 84), KWIN)), 2, 0, 20), badge(s.x(20), s.y(cs[20].h), 3, 0, -20, 'm'), badge(s.x(78), s.y(cs[78].h), 4, -4, -22), badge(s.x(95), s.y(cs[95].h), 5, -6, -24)];
  const A = narrow || heroClash(W, H, T) ? B() : heroAnn(W, H, E, T).map(a => a.svg);
  h += A.join('');
  return h.replace(/data-a="(\d)"/g, (m, n) => `${m}${+n <= stage ? ' data-on' : ''}`);
}
function heroAnn(W: number, H: number, E: number, T: KText) {
  const cs = K, s = scale(cs, W, H, [84, 16, 22, 10]), st = E - KWIN + 1, hiNow = rollHi(cs, E, KWIN);
  // Üç satır: 18 (3 ve 5), 40 (1 ve 4), 62 (2).
  return [ann('hlak', s.x(st) + 2, s.y(s.mx) - 8, s.x(st) + 10, 40, '1', T.annK[0], 'start'),
    ann('hlak', s.x(Math.max(st, 62)), s.y(hiNow), s.x(st) + 44, 62, '2', T.annK[1], 'start'),
    ann('hlak', s.x(20), s.y(cs[20].h), s.x(4), 18, '3', T.annK[2], 'start', 'm'),
    ann('hlak', s.x(78), s.y(cs[78].h) - 6, s.x(86), 40, '4', T.annK[3], 'end'),
    ann('hlak', s.x(95), s.y(cs[95].h) - 8, s.x(95) - 6, 18, '5', T.annK[4], 'end')];
}
/** Oklu açıklamalar canlandırmanın hiçbir karesinde taşmıyor ve çakışmıyorsa kullanılır; yoksa numaralı rozetler. */
const clashCache = new Map<string, boolean>();
function heroClash(W: number, H: number, T: KText): boolean {
  const key = W + '|' + T.annK.join('|');
  if (!clashCache.has(key)) {
    let bad = false;
    for (let e = KWIN; e <= KLAST && !bad; e++) {
      const L = heroAnn(W, H, e, T).slice(0, heroStage(e)).map(a => a.box);
      bad = L.some((a, i) => a.x0 < 0 || a.x1 > W || L.some((b, j) => j > i && hit(a, b)));
    }
    clashCache.set(key, bad);
  }
  return clashCache.get(key)!;
}
export const heroStage = (E: number) => E < 60 ? 1 : E < 69 ? 2 : E < 78 ? 3 : E < KLAST ? 4 : 5;

/* ---------- kaydırmalı grafik ---------- */
export interface PText { winP: string; tagHi: string; tagLo: string }
export function winState(E: number) {
  const hi = rollHi(P, E, KWIN), lo = rollLo(P, E, KWIN), c = P[E];
  const up = c.h > hi, dn = !up && c.l < lo;
  return { hi, lo, c, up, dn, p: up ? c.h : dn ? c.l : c.c };
}
export function winSvg(W: number, H: number, E: number, T: PText, N: HlNum): string {
  const narrow = W < 560, padR = narrow ? 62 : 84, s = scale(P, W, H, [30, padR, 24, 8]), st = E - KWIN + 1, S = winState(E);
  let h = `<rect class="win" x="${f1(s.x(st) - s.st / 2)}" y="8" width="${f1(s.x(E) - s.x(st) + s.st)}" height="${H - 30}" rx="8"/><text class="wl" x="${f1((s.x(st) + s.x(E)) / 2)}" y="${H - 8}" text-anchor="middle">⟵ ${esc(T.winP)} ⟶</text>`;
  h += candles(P, s, 0, KLAST) + candles(P, s, st, E, 'in');
  const x0 = f1(s.x(st) - s.st / 2), x1 = f1(s.x(E) + s.st / 2);
  h += `<line class="hl" x1="${x0}" x2="${x1}" y1="${s.y(S.hi)}" y2="${s.y(S.hi)}"/><line class="ll" x1="${x0}" x2="${x1}" y1="${s.y(S.lo)}" y2="${s.y(S.lo)}"/>`;
  h += `<text class="gapt h" x="${s.x(st)}" y="${f1(s.y(S.hi) - 6)}">${esc(fill(T.tagHi, { v: num(N, S.hi, 0) }))}</text><text class="gapt l" x="${s.x(st)}" y="${f1(s.y(S.lo) + 15)}">${esc(fill(T.tagLo, { v: num(N, S.lo, 0) }))}</text>`;
  const x = s.x(E), y = s.y(S.p);
  if (!S.up) h += `<line class="gap h" x1="${x + 12}" x2="${x + 12}" y1="${s.y(S.hi)}" y2="${f1(y - 8)}"/><text class="gapt h" x="${x + 18}" y="${f1((s.y(S.hi) + y) / 2 + 4)}">+${num(N, (S.hi / S.c.c - 1) * 100, 1)}%</text>`;
  if (!S.dn) h += `<line class="gap l" x1="${x + 12}" x2="${x + 12}" y1="${f1(y + 8)}" y2="${s.y(S.lo)}"/><text class="gapt l" x="${x + 18}" y="${f1((s.y(S.lo) + y) / 2 + 4)}">−${num(N, (1 - S.lo / S.c.c) * 100, 1)}%</text>`;
  h += `<line class="now" x1="${x}" x2="${x}" y1="8" y2="${H - 22}"/><circle class="dotpz" cx="${x}" cy="${y}" r="9"/><circle class="dot" cx="${x}" cy="${y}" r="9"/>`;
  const lbl = num(N, S.p, 0) + ' $', lw = f1(tw(lbl, 10.5) + 18), lx = f1(Math.min(Math.max(x - lw / 2, 4), W - lw - 4));
  h += `<g class="tag"><rect x="${lx}" y="${f1(y - 36)}" width="${lw}" height="20" rx="10"/><text x="${f1(lx + lw / 2)}" y="${f1(y - 22)}" text-anchor="middle">${lbl}</text></g>`;
  if (S.up || S.dn) h += `<circle class="ring ${S.up ? 'h' : 'l'} open" cx="${x}" cy="${y}" r="13"/>`;
  return h;
}
/** Grafikteki x konumundan mum indeksi (sürükleme için). */
export const winIndex = (W: number, xx: number) => { const padR = W < 560 ? 62 : 84; const st = (W - padR - 8) / P.length; return Math.max(KWIN, Math.min(KLAST, Math.round((xx - 8) / st - .5))); };

/* ---------- bir gün ---------- */
export type Mode = 'h' | 'l' | 'b';
export type Pol = 'once' | 'rep';
export interface Ev { e: number; k: 'h' | 'l'; st: 'ok' | 'sil' | 'off'; v: number }
export function dayEvents(mode: Mode, pol: Pol): Ev[] {
  const ev: Ev[] = []; let last = -99, done = false;
  for (let e = D0; e <= DLAST; e++) {
    const hi = rollHi(D, e, DWIN), lo = rollLo(D, e, DWIN); let k: 'h' | 'l' | null = null;
    if (D[e].h > hi && mode !== 'l') k = 'h'; else if (D[e].l < lo && mode !== 'h') k = 'l';
    if (!k) continue;
    let st: Ev['st'] = 'ok'; if (done) st = 'off'; else if (pol === 'rep' && e - last < CD) st = 'sil';
    if (st === 'ok') { last = e; if (pol === 'once') done = true; }
    ev.push({ e, k, st, v: k === 'h' ? D[e].h : D[e].l });
  }
  return ev;
}
export const dayTime = (e: number) => { const m = (e - D0) * 15; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
export interface NText { annN: { hi: string; sil: string; once: string; lo: string } }
export function daySvg(W: number, H: number, E: number, mode: Mode, pol: Pol, T: NText): string {
  const narrow = W < 560, s = scale(D.slice(D0 - 8), W, H, [narrow ? 62 : 52, narrow ? 8 : 14, 24, 8], D0 - 8);
  let h = defs('hlan') + candles(D, s, D0 - 8, E);
  if (mode !== 'l') h += `<path class="stair h" d="${stair(D, s, D0, E, DWIN, false)}"/>`;
  if (mode !== 'h') h += `<path class="stair l" d="${stair(D, s, D0, E, DWIN, true)}"/>`;
  for (const i of [0, 24, 48, 72, 95]) h += `<text class="ax" x="${s.x(D0 + i)}" y="${H - 6}" text-anchor="middle">${i === 95 ? '24:00' : dayTime(D0 + i)}</text>`;
  const ev = dayEvents(mode, pol).filter(x => x.e <= E); let n = 0;
  for (const x of ev) {
    const cx = s.x(x.e), cy = f1(s.y(x.v) + (x.k === 'h' ? -4 : 4));
    if (x.st === 'ok') { n++; h += `<circle class="ring ${x.k}" cx="${cx}" cy="${cy}" r="7"/><text class="rn" x="${cx}" y="${f1(cy + 3.5)}" text-anchor="middle">${n}</text>`; }
    else h += `<circle class="silent" cx="${cx}" cy="${cy}" r="5"/>`;
  }
  const first = ev.find(x => x.st === 'ok'), sil = ev.find(x => x.st === 'sil'), fl = ev.find(x => x.k === 'l' && x.st === 'ok');
  const A: { svg: string; box: Box }[] = [];
  if (first) A.push(ann('hlan', s.x(first.e), s.y(first.v) - 10, narrow ? 12 : s.x(first.e) - 160, 14, '1', fill(first.k === 'h' ? T.annN.hi : T.annN.lo, { t: dayTime(first.e) }), 'start'));
  if (sil && pol === 'rep') A.push(ann('hlan', s.x(sil.e), s.y(sil.v) - 8, narrow ? 12 : s.x(sil.e) + 40, narrow ? 36 : 14, '·', T.annN.sil, 'start', 'm'));
  if (pol === 'once' && first) A.push(ann('hlan', s.x(first.e) + 20, s.y(first.v), narrow ? 12 : s.x(first.e) + 60, narrow ? 36 : 14, '✓', T.annN.once, 'start', 'm'));
  if (fl && fl !== first) A.push(ann('hlan', s.x(fl.e), s.y(fl.v) + 8, narrow ? 12 : s.x(fl.e) - 10, H - 34, '↓', fill(T.annN.lo, { t: dayTime(fl.e) }), narrow ? 'start' : 'end'));
  // Sığmayan ya da çakışan açıklamayı çizme; olaylar alttaki listede de yazıyor.
  const keep: typeof A = [];
  for (const a of A) if (a.box.x0 >= 0 && a.box.x1 <= W && !keep.some(b => hit(a.box, b.box))) keep.push(a);
  return h + keep.map(a => a.svg.replace('class="hl-a', 'data-on class="hl-a')).join('');
}

/* ---------- bildirim metinleri ---------- */
export function pushHtml(L: HlLang, coin: string, dir: 'h' | 'l', price: number, time: string): string {
  const title = fill(L.push[dir], { 0: coin }), body = `${dir === 'l' ? '↓' : '↑'} ${num(L.num, price, 4, true)} $  │  ${dir === 'l' ? L.push.ll : L.push.hl}  ✓`;
  return `<img src="/icons/logo-96.png" alt="" width="38" height="38" loading="lazy"><div class="mcp-x"><div class="mcp-h"><b>MarketAlert</b><span>${esc(time)}</span></div><b class="mcp-t">${esc(title)}</b><span class="mcp-b" dir="ltr">${esc(body)}</span></div>`;
}
export function tgMsg(L: HlLang, coin: string, dir: 'h' | 'l', price: number, alarm: string) {
  return {
    text: `${dir === 'l' ? '🔴' : '🟢'} <b>${esc(fill(L.tg[dir], { 0: coin }))}</b>\n<i>🔔 ${esc(alarm)}</i>\n<blockquote>${esc(dir === 'l' ? L.tg.ll : L.tg.hl)}: <b>${num(L.num, price, 4, true)}</b></blockquote>\n⏱ ${esc(L.tg.market)}`,
    button: L.tg.button,
  };
}
