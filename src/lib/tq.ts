/**
 * Eşik raporu sayfası (/tools/threshold-report/, 2026-11-19): MarketAlert API'nin dakikalık hesaplanmış raporunu çizer.
 * Tasarım E: sade cetvel grafiği (eşiğin ötesi düz renk, yakın bant taralı; dikkat isteyen coinler üstte değer etiketiyle,
 * diğerleri altta soluk noktalar), üç sayı kartı ve üç liste. Fiyat gösterilmez; veri GET /api/MarketData/ThresholdReport.
 */
export const API = 'https://api.marketalertapp.com/api/MarketData/ThresholdReport';
export const TFS = ['15m', '1h', '4h', '1d'] as const;
export type Metric = 'rsi' | 'ch' | 'hi' | 'vx';
export interface Coin { symbolCode: string; baseAssetCode: string; rsi: Record<string, number | null>; change24h: number | null; fromHigh24h: number | null; volumeMultiple: number | null }
export interface Crossing { symbolCode: string; metric: string; timeframe: string | null; threshold: number; direction: string; atUtc: string }
export interface Report { generatedAtUtc: string | null; coins: Coin[]; crossings: Crossing[] }

type Def = { min: number; max: number; lo: number | null; hi: number; near: number; ticks: number[]; v: (c: Coin, tf: string) => number | null };
export const MET: Record<Metric, Def> = {
  rsi: { min: 0, max: 100, lo: 30, hi: 70, near: 3.5, ticks: [0, 20, 40, 60, 80, 100], v: (c, tf) => c.rsi?.[tf] ?? null },
  ch: { min: -20, max: 20, lo: -10, hi: 10, near: 2, ticks: [-20, -10, 0, 10, 20], v: c => c.change24h },
  hi: { min: -10, max: 0, lo: null, hi: -1, near: 1, ticks: [-10, -5, 0], v: c => c.fromHigh24h },
  vx: { min: 0, max: 8, lo: null, hi: 3, near: 0.6, ticks: [0, 2, 4, 6, 8], v: c => c.volumeMultiple },
};
const METRIC_KEY: Record<string, Metric> = { rsi: 'rsi', change24h: 'ch', fromHigh24h: 'hi', volumeMultiple: 'vx' };

const cl = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const hue = (s: string) => [...s].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 360;
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
export const av = (s: string) => `<span class="av" style="background:hsl(${hue(s)} 50% 40%)">${esc(s.slice(0, 4))}</span>`;
const fill = (t: string, o: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_m, k) => String(o[k] ?? ''));

/** Bölge: 'lo'/'hi' eşiğin ötesi, 'nl'/'nh' eşiğe yakın, '' nötr. Sınır değeri eşik sayılır (API ile aynı: RSI ≤ 30, ≥ 70). */
export function zone(m: Def, v: number): string {
  if (m.lo !== null && v <= m.lo) return 'lo';
  if (v >= m.hi) return 'hi';
  const a = m.lo !== null ? v - m.lo : Infinity, b = m.hi - v;
  if (Math.min(a, b) < m.near) return a < b ? 'nl' : 'nh';
  return '';
}
export function gapOf(m: Def, v: number) { const a = m.lo !== null ? v - m.lo : Infinity, b = m.hi - v; return a < b ? { g: a, lo: true } : { g: b, lo: false }; }

/** Sayfaya bağlanır; metinler sunucuda üretilen JSON'dan gelir. */
export function mount(root: HTMLElement, T: any, lang: string) {
  const $ = <E extends Element = HTMLElement>(s: string, r: ParentNode = root) => r.querySelector(s) as E;
  const $$ = (s: string, r: ParentNode = root) => Array.from(r.querySelectorAll<HTMLElement>(s));
  const nf = new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nf0 = new Intl.NumberFormat(lang, { maximumFractionDigits: 0 });
  const pf = (v: number, d = 1) => new Intl.NumberFormat(lang, { style: 'percent', signDisplay: 'exceptZero', minimumFractionDigits: d, maximumFractionDigits: d }).format(v / 100);
  const tfmt = new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const fmt: Record<Metric, (v: number) => string> = { rsi: v => nf.format(v), ch: v => pf(v), hi: v => pf(v), vx: v => '×' + nf.format(v) };
  const lb: Record<Metric, (v: number) => string> = { rsi: v => nf0.format(v), ch: v => pf(v, 0), hi: v => pf(v, 0), vx: v => '×' + nf0.format(v) };
  const gap = (k: Metric, v: number) => fill(k === 'vx' ? T.unitX : T.unitPt, { v: nf.format(Math.abs(v)) });
  const S: { m: Metric; tf: string } = { m: 'rsi', tf: '1h' };
  let R: Report | null = null;
  let seen = new Set<string>();
  const BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
  const bell = (s: string) => `<button type="button" class="tq-bell" data-al="${esc(s)}" aria-label="${esc(fill(T.bell, { s }))}">${BELL}</button>`;
  const cn = (c: Coin) => `<span class="cn">${av(c.baseAssetCode)}${esc(c.baseAssetCode)}</span>`;
  const zoneLabel = (k: Metric, side: 'lo' | 'hi') => T.zones[k + (side === 'lo' ? 'Lo' : 'Hi')];

  function draw() {
    const m = MET[S.m], k = S.m, coins = R?.coins ?? [];
    $('[data-tg]').hidden = k !== 'rsi';
    $('[data-q]').textContent = fill(T.q[k], { tf: S.tf, n: coins.length });
    const vals = coins.map(c => ({ c, v: m.v(c, S.tf) })).filter((x): x is { c: Coin; v: number } => typeof x.v === 'number');
    const nLo = vals.filter(x => zone(m, x.v) === 'lo').length, nHi = vals.filter(x => zone(m, x.v) === 'hi').length, nNr = vals.filter(x => /^n/.test(zone(m, x.v))).length;
    const card = (color: string, label: string, n: number) => `<div><small><i style="background:${color}"></i>${esc(label)}</small><b>${n}<span>${esc(T.stats.coin)}</span></b></div>`;
    $('[data-st]').innerHTML = (m.lo !== null ? card('var(--cold)', zoneLabel(k, 'lo'), nLo) : card('var(--mut)', T.stats.watched, coins.length)) + card('var(--hot)', zoneLabel(k, 'hi'), nHi) + card('var(--tx)', T.stats.near, nNr);
    drawChart(m, k, vals);
    lists(m, k, vals);
  }

  function drawChart(m: Def, k: Metric, vals: { c: Coin; v: number }[]) {
    const ch = $('[data-ch]'), pin = $('[data-in]'), msg = $('[data-msg]');
    msg.hidden = vals.length > 0;
    if (!vals.length) { msg.textContent = R ? T.empty : T.loading; ch.style.height = '200px'; $$('.tq-c', pin).forEach(e => e.remove()); return; }
    const W = pin.clientWidth, rtl = getComputedStyle(pin).direction === 'rtl';
    const X = (v: number) => (cl(v, m.min, m.max) - m.min) / (m.max - m.min) * 100;
    const pos = (v: number) => rtl ? 100 - X(v) : X(v);
    const have = new Map($$('.tq-c', pin).map(e => [e.dataset.c!, e]));
    const F: any[] = [], O: any[] = [];
    for (const { c, v } of vals) {
      let el = have.get(c.symbolCode);
      if (!el) { el = document.createElement('button'); el.type = 'button'; el.className = 'tq-c'; el.dataset.c = el.dataset.al = c.symbolCode; el.setAttribute('aria-label', c.baseAssetCode); el.innerHTML = av(c.baseAssetCode) + '<span class="lb"></span>'; pin.appendChild(el); }
      have.delete(c.symbolCode);
      const z = zone(m, v);
      el.className = 'tq-c ' + (z === 'lo' || z === 'hi' ? 'in' : z ? 'nr' : '');
      $('.lb', el).textContent = z ? fmt[k](v) : '';
      el.setAttribute('aria-label', `${c.baseAssetCode} ${fmt[k](v)}`);
      (z ? F : O).push({ el, x: pos(v) / 100 * W });
    }
    have.forEach(e => e.remove());
    const stack = (L: any[], gapPx: number) => { L.sort((a, b) => a.x - b.x); const last: number[] = []; L.forEach(o => { let row = 0; while (last[row] !== undefined && o.x - last[row] < gapPx) row++; last[row] = o.x; o.row = row; }); return Math.max(0, ...L.map(o => o.row)) + 1; };
    const fr = F.length ? stack(F, innerWidth <= 760 ? 46 : 52) : 0, rr = stack(O, 22);
    const bandY = 24 + Math.max(1, fr) * 40 + 28, H = bandY + 30 + rr * 22 + 40;
    ch.style.height = H + 'px';
    $('.tq-band', pin).style.top = bandY + 'px';
    F.forEach(o => { o.el.style.left = o.x + 'px'; o.el.style.top = (bandY - 28 - o.row * 40) + 'px'; });
    O.forEach(o => { o.el.style.left = o.x + 'px'; o.el.style.top = (bandY + 26 + o.row * 22) + 'px'; });
    const seg = (cls: string, a: number | null, b: number | null) => { const el = $('.tq-band i.' + cls, pin); if (a === null || b === null) { el.style.width = '0'; return; } const p = pos(a), q = pos(b); el.style.left = Math.min(p, q) + '%'; el.style.width = Math.abs(p - q) + '%'; };
    seg('lo', m.lo === null ? null : m.min, m.lo); seg('nl', m.lo, m.lo === null ? null : m.lo + m.near); seg('hi', m.hi, m.max); seg('nh', m.hi - m.near, m.hi);
    const th = (side: 'lo' | 'hi', v: number | null) => {
      const el = $('.tq-th.' + side, pin), vl = $('.tq-vl.' + side, pin);
      el.hidden = vl.hidden = v === null; if (v === null) return;
      el.style.left = vl.style.left = pos(v) + '%'; el.style.top = (H - 36) + 'px';
      $('b', el).textContent = lb[k](v); $('span', el).textContent = zoneLabel(k, side);
      vl.style.top = '8px'; vl.style.height = (H - 48) + 'px';
    };
    th('lo', m.lo); th('hi', m.hi);
  }

  function lists(m: Def, k: Metric, vals: { c: Coin; v: number }[]) {
    const beyond = vals.filter(x => /^(lo|hi)$/.test(zone(m, x.v))).sort((a, b) => Math.abs(b.v - (m.lo ?? m.min)) - Math.abs(a.v - (m.lo ?? m.min)));
    $('[data-n1]').textContent = `${beyond.length} ${T.stats.coin}`;
    $('[data-l1]').innerHTML = beyond.map(({ c, v }) => `<li>${cn(c)}<span class="x"><b class="${zone(m, v)}" dir="ltr">${fmt[k](v)}</b></span>${bell(c.symbolCode)}</li>`).join('') || `<li><span class="mu">${esc(R ? T.none : T.loading)}</span></li>`;
    const near = vals.filter(x => !/^(lo|hi)$/.test(zone(m, x.v))).map(x => ({ ...x, ...gapOf(m, x.v) })).sort((a, b) => a.g - b.g).slice(0, 6);
    $('[data-l2]').innerHTML = near.map(x => `<li>${cn(x.c)}<span class="x"><span class="g"><i style="width:${cl(100 - x.g / (m.near * 2) * 100, 4, 100)}%"></i></span>${esc(fill(T.gapTo, { t: lb[k](x.lo ? m.lo! : m.hi), g: gap(k, x.g) }))}</span>${bell(x.c.symbolCode)}</li>`).join('') || `<li><span class="mu">${esc(R ? T.none : T.loading)}</span></li>`;
    const ev = (R?.crossings ?? []).filter(e => METRIC_KEY[e.metric] === k && (k !== 'rsi' || e.timeframe === S.tf)).slice(0, 6);
    const byCode = new Map((R?.coins ?? []).map(c => [c.symbolCode, c]));
    $('[data-l3]').innerHTML = ev.map(e => { const c = byCode.get(e.symbolCode); const key = k + (e.direction === 'down' ? 'Down' : 'Up'); return `<li class="e"><time>${tfmt.format(new Date(e.atUtc))}</time><span><b>${esc(c?.baseAssetCode ?? e.symbolCode)}</b> ${esc(fill(T.cross[key], { tf: e.timeframe ?? '' }))}</span>${bell(e.symbolCode)}</li>`; }).join('') || `<li class="e"><span class="mu">${esc(R ? T.noCross : T.loading)}</span></li>`;
  }

  // Alarm önerileri: coine dokununca açılır; her öneri ilgili rehber sayfasına gider.
  const sh = $('.tq-sh'), bg = $('.tq-sh-bg');
  const close = () => { sh.classList.remove('on'); bg.classList.remove('on'); };
  $('.tq-sh header button').addEventListener('click', close); bg.addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  root.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-al]');
    if (b) { e.preventDefault(); openSheet(b.dataset.al!); return; }
    const mb = (e.target as HTMLElement).closest<HTMLElement>('[data-m]');
    if (mb) { S.m = mb.dataset.m as Metric; $$('[data-m]').forEach(x => x.setAttribute('aria-pressed', String(x === mb))); draw(); (window as any).maTrack?.('report_metric', { metric: S.m }); return; }
    const tb = (e.target as HTMLElement).closest<HTMLElement>('[data-tf]');
    if (tb) { S.tf = tb.dataset.tf!; $$('[data-tf]').forEach(x => x.setAttribute('aria-pressed', String(x === tb))); draw(); }
  });
  function openSheet(symbol: string) {
    const c = R?.coins.find(x => x.symbolCode === symbol); if (!c) return;
    const r = c.rsi?.[S.tf] ?? c.rsi?.['1h'] ?? null, tf = c.rsi?.[S.tf] != null ? S.tf : '1h';
    $('[data-sa]', sh).innerHTML = av(c.baseAssetCode);
    $('[data-sn]', sh).textContent = fill(T.sheet.title, { s: c.baseAssetCode });
    const cell = (l: string, v: string, cls = '') => `<div>${esc(l)}<b class="${cls}">${v}</b></div>`;
    $('[data-ss]', sh).innerHTML = cell(`RSI ${tf}`, r === null ? '–' : fmt.rsi(r)) + cell(T.sheet.stats[0], c.change24h === null ? '–' : fmt.ch(c.change24h)) + cell(T.sheet.stats[1], c.fromHigh24h === null ? '–' : fmt.hi(c.fromHigh24h)) + cell(T.sheet.stats[2], c.volumeMultiple === null ? '–' : fmt.vx(c.volumeMultiple));
    const now = (s: string) => fill(T.sheet.now, { v: s });
    const rows: [string, string, string][] = [
      [fill(T.sug.rsiLo, { tf }), r === null ? '' : r <= 30 ? T.sheet.below : fill(T.gapTo, { t: '30', g: gap('rsi', r - 30) }), 'rsi-overbought-oversold-alerts'],
      [fill(T.sug.rsiHi, { tf }), r === null ? '' : r >= 70 ? T.sheet.above : fill(T.gapTo, { t: '70', g: gap('rsi', 70 - r) }), 'rsi-overbought-oversold-alerts'],
      [T.sug.hi, c.fromHigh24h === null ? '' : now(fmt.hi(c.fromHigh24h)), '24h-high-low-alerts'],
      [T.sug.ch, c.change24h === null ? '' : now(fmt.ch(c.change24h)), 'percent-change-alerts'],
      [T.sug.pump, c.volumeMultiple === null ? '' : now(fmt.vx(c.volumeMultiple)), 'pump-alerts'],
    ];
    if (r !== null && r > 50) rows.unshift(rows.splice(1, 1)[0]);
    $('[data-sl]', sh).innerHTML = rows.map(([t, s, slug]) => `<li><span>${esc(t)}<small dir="auto">${esc(s)}</small></span><a href="/${root.dataset.code}/features/${slug}/">${esc(T.sheet.how)}</a></li>`).join('');
    sh.classList.add('on'); bg.classList.add('on');
    (window as any).maTrack?.('report_coin', { coin: c.baseAssetCode });
  }

  async function load() {
    try {
      const res = await fetch(API, { headers: { Accept: 'application/json' } });
      const body = await res.json();
      const data: Report | undefined = body?.data ?? body?.Data;
      if (!res.ok || !data) throw new Error('rapor yok');
      const before = seen;
      R = data.generatedAtUtc ? data : (R ?? null);
      const ey = $('[data-ey]');
      ey.classList.toggle('off', !data.generatedAtUtc);
      if (data.generatedAtUtc) $('[data-t]').textContent = tfmt.format(new Date(data.generatedAtUtc));
      draw();
      // Yeni geçiş yapan coin grafikte bir kez halkalanır.
      seen = new Set((R?.crossings ?? []).map(x => x.symbolCode + x.metric + x.timeframe + x.atUtc));
      if (before.size) (R?.crossings ?? []).filter(x => !before.has(x.symbolCode + x.metric + x.timeframe + x.atUtc)).forEach(x => { const el = $(`.tq-c[data-c="${CSS.escape(x.symbolCode)}"]`); if (el) { el.classList.remove('ring'); void el.offsetWidth; el.classList.add('ring'); } });
    } catch {
      if (!R) { $('[data-msg]').hidden = false; $('[data-msg]').textContent = T.error; }
      $('[data-ey]').classList.add('off');
    }
  }
  draw();
  load();
  setInterval(() => { if (!document.hidden) load(); }, 60_000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });
  let rz = 0; addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(draw); });
}
