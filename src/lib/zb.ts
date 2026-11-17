/**
 * Zilbo, Zilbe ve Zilba oynatıcısı (12. gün, 2026-11-16). Kareler /zilbo/aile-2.json içinde (≈80 KB gzip; 13. günde Zilbe sevin, Zilba şaşır, Zilbo sevin eklendi),
 * yalnızca karakterli bölüm ekrana yaklaşınca indirilir. O zamana kadar ve hareket azaltma açıkken
 * karakterler duran resimdir (/zilbo/{kim}-el.webp). Karakterler süstür; sayfanın anlamı metinde kalır.
 * Kurallar: küçük kalırlar, yalnızca bir olayda (seviye, dokunuş) bir kez oynarlar, sonra ilk kareye dönerler.
 */
type Frames = Record<string, string[]> & { defs: string };
let framesP: Promise<Frames> | null = null;
export const zbReduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const zbLoad = () => framesP ??= fetch('/zilbo/aile-2.json').then(r => r.json()).then((f: Frames) => {
  const holder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  holder.setAttribute('width', '0'); holder.setAttribute('height', '0'); holder.setAttribute('aria-hidden', 'true');
  holder.style.position = 'absolute';
  holder.innerHTML = `<defs>${f.defs}</defs>`;
  document.body.append(holder);
  return f;
});
const timers = new WeakMap<HTMLElement, number>();
const svgOf = (el: HTMLElement) => {
  let s = el.querySelector('svg');
  if (!s) {
    s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '-150 -290 300 318'); s.setAttribute('aria-hidden', 'true');
    el.append(s); el.classList.add('zb-on');
  }
  return s;
};
/** Karakteri bir kez oynatır (ör. 'zilbo-zil'); bittiğinde ilk kareye döner. Hareket azaltmada hiçbir şey yapmaz. */
export const zbPlay = (el: HTMLElement | null, key: string) => new Promise<void>(done => {
  if (!el || zbReduce) return done();
  zbLoad().then(f => {
    const fr = f[key]; if (!fr) return done();
    const s = svgOf(el);
    clearInterval(timers.get(el));
    let i = 0;
    timers.set(el, window.setInterval(() => {
      s.innerHTML = fr[Math.min(i, fr.length - 1)];
      if (++i > fr.length) { clearInterval(timers.get(el)); s.innerHTML = fr[0]; done(); }
    }, 40));
  }).catch(() => done());
});
/** Bölüm ekrana yaklaşınca kareleri önceden indirir. */
export const zbPrime = (root: Element) => {
  if (zbReduce) return;
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { zbLoad(); io.disconnect(); } }, { rootMargin: '300px' });
  io.observe(root);
};
export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
/** Döngülü sahneler yalnızca bölüm görünürken ve sekme açıkken ilerler. */
export const watchVisible = (el: Element, threshold = .3) => {
  const st = { on: false };
  new IntersectionObserver(es => { st.on = es[0].isIntersecting; }, { threshold }).observe(el);
  return async () => { while (!st.on || document.hidden) await sleep(400); };
};
