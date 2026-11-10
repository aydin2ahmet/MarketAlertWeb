// IndexNow: Bing, Yandex ve diğer arama motorlarına yeni ya da değişen sayfaları bildirir.
// prepare: dist'teki site haritası adreslerinin HTML özetini dist/indexnow.json'a yazar, yayındaki
//          eski özetle karşılaştırır, değişenleri indexnow-urls.txt'ye koyar (yayından ÖNCE çalışır).
// submit:  indexnow-urls.txt'deki adresleri gönderir (yayından SONRA çalışır).
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://www.marketalertapp.com';
const KEY = 'd7640e9fc9c43491644ea85810e02759';
const LIST = 'indexnow-urls.txt';

async function prepare() {
  const maps = readdirSync('dist').filter(f => /^sitemap-\d+\.xml$/.test(f));
  const urls = maps.flatMap(f => [...readFileSync(join('dist', f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
  const now = {};
  for (const u of urls) {
    const file = join('dist', new URL(u).pathname, 'index.html');
    if (existsSync(file)) now[u] = createHash('sha1').update(readFileSync(file)).digest('hex');
  }
  writeFileSync('dist/indexnow.json', JSON.stringify(now));
  let old = {};
  try {
    const r = await fetch(SITE + '/indexnow.json', { cache: 'no-store' });
    if (r.ok) old = await r.json();
  } catch {}
  const changed = Object.keys(now).filter(u => old[u] !== now[u]);
  writeFileSync(LIST, changed.join('\n'));
  console.log(`IndexNow: ${urls.length} adres, ${changed.length} yeni ya da değişmiş`);
}

async function submit() {
  const urlList = existsSync(LIST) ? readFileSync(LIST, 'utf8').split('\n').filter(Boolean) : [];
  if (!urlList.length) return console.log('IndexNow: bildirilecek adres yok');
  for (let i = 0; i < urlList.length; i += 10000) {
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urlList.slice(i, i + 10000) }),
    });
    console.log(`IndexNow: ${urlList.length} adres gönderildi, yanıt ${r.status}`);
    // 200/202 kabul; 4xx/5xx yayını bozmasın diye yalnız uyarı.
    if (r.status >= 300) console.log('::warning::IndexNow yanıtı ' + r.status + ': ' + (await r.text()).slice(0, 300));
  }
}

const run = { prepare, submit }[process.argv[2]];
if (run) await run(); else { console.error('kullanım: node scripts/indexnow.mjs prepare|submit'); process.exit(1); }
