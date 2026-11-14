/**
 * 10. gün (yapay zekâ sayfası) Zilbo oynatıcısı. Kareler /zilbo/zilbo-ai.json içinde (zipla, sasir, el, zil, sevin);
 * dosya ancak bir Zilbo ekrana yaklaşınca bir kez indirilir. Kareler 40 ms, yalnızca görünen Zilbo'lar oynar.
 * Hareketi azalt açıkken ve dosya gelene kadar /zilbo/zilbo.webp durağan resmi görünür.
 */
type Frames = Record<string, string[]> & { defs: string };
type St = { el: HTMLElement; svg: SVGSVGElement; m: string; i: number; loop: boolean; next: string | null; vis: boolean };
export const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
let F: Frames | null = null;
let P: Promise<Frames> | null = null;
const all = new Map<HTMLElement, St>();
const load = () => P ??= fetch('/zilbo/zilbo-ai.json').then(r => r.json()).then((f: Frames) => {
  const h = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  h.setAttribute('width', '0'); h.setAttribute('height', '0'); h.setAttribute('aria-hidden', 'true'); h.style.position = 'absolute';
  h.innerHTML = `<defs>${f.defs}</defs>`; document.body.append(h); F = f;
  setInterval(() => {
    for (const s of all.values()) {
      if (!s.vis) continue;
      const fr = f[s.m]; s.i++;
      if (s.i >= fr.length) { if (s.loop) s.i = 0; else if (s.next) { s.m = s.next; s.next = null; s.loop = true; s.i = 0; } else s.i = fr.length - 1; }
      s.svg.innerHTML = f[s.m][s.i];
    }
  }, 40);
  for (const s of all.values()) { s.svg.innerHTML = f[s.m][0]; s.el.classList.add('ai-live'); }
  return f;
});
/** .ai-zb öğesini oynatıcıya bağlar. */
export function zbInit(el: HTMLElement) {
  if (reduce || all.has(el)) return;
  const svg = el.querySelector('svg') as SVGSVGElement;
  const s: St = { el, svg, m: el.dataset.m || 'el', i: 0, loop: true, next: null, vis: false };
  all.set(el, s);
  new IntersectionObserver(es => { s.vis = es[0].isIntersecting; if (s.vis) load(); }, { rootMargin: '200px' }).observe(el);
  if (F) { svg.innerHTML = F[s.m][0]; el.classList.add('ai-live'); }
}
/** Hareketi değiştirir; loop=false ise bitince next'e geçer (yoksa son karede kalır). */
export function zbPlay(el: HTMLElement | null, m: string, loop = true, next: string | null = null) {
  const s = el && all.get(el); if (!s) return;
  s.m = m; s.i = 0; s.loop = loop; s.next = next;
}
export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
export const onVisible = (el: Element, f: () => void, threshold = 0.3) => {
  const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { o.disconnect(); f(); } }, { threshold });
  o.observe(el);
};
