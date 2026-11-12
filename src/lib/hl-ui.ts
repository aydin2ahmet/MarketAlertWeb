/**
 * 24 saat sayfası tarayıcı yardımcısı: SVG'yi kutusunun genişliğinde yeniden çizer.
 * ResizeObserver geri çağrısında doğrudan çizmek "ResizeObserver loop completed" uyarısına yol açıyordu (2026-11-12);
 * çizim bir sonraki kareye ertelenir ve genişlik değişmediyse yapılmaz.
 */
export function sized(svg: SVGSVGElement, height: number | ((W: number) => number), draw: (W: number, H: number) => void) {
  let lastW = 0, raf = 0;
  const width = () => Math.max(300, Math.round(svg.parentElement!.clientWidth));
  const go = () => { const W = width(), H = typeof height === 'number' ? height : height(W); lastW = W; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); draw(W, H); };
  new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (width() !== lastW) go(); }); }).observe(svg.parentElement!);
  go();
  return go;
}
