/** Verify per-page og identity + robots + chips on the local build. */
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3100';
const checks = [
  ['/en', 'Quantiviq — Rebuild the Company for the Agentic Era'],
  ['/fa', 'Quantiviq — Rebuild'],
  ['/en/lab', 'AI Decision Intelligence Laboratory'],
  ['/en/system', 'The System'],
  ['/en/proof', 'Proof'],
  ['/en/leadership', 'Majid Asghari Tabrizi — AI Product & Transformation Leadership'],
  ['/en/about', 'About'],
  ['/en/contact', 'Contact'],
  ['/resume', 'Résumé'],
  ['/work', 'Work'],
  ['/work/phoenix', 'Phoenix — case study'],
  ['/journey', 'Journey'],
  ['/profile', 'Majid Asghari'],
];
let fail = 0;
for (const [path, titlePart] of checks) {
  const html = await (await fetch(BASE + path)).text();
  const og = (k) => (html.match(new RegExp(`<meta property="og:${k}" content="([^"]*)"`)) || [])[1] || null;
  const twCard = (html.match(/<meta name="twitter:card" content="([^"]*)"/) || [])[1] || null;
  const okTitle = og('title') && og('title').includes(titlePart.replace('…', ''));
  const okUrl = og('url') === `https://quantiviq.xyz${path}`;
  const okImg = og('image') && og('image').endsWith('/og/quantiviq-og.png');
  const okCard = twCard === 'summary_large_image';
  const pass = okTitle && okUrl && okImg && okCard;
  if (!pass) fail++;
  console.log(`${pass ? 'PASS' : 'FAIL'} ${path}`);
  if (!pass) console.log(`   og:title=${og('title')?.slice(0, 50)} | og:url=${og('url')} | img=${og('image')?.slice(-30)} | card=${twCard}`);
}
const robots = await (await fetch(BASE + '/robots.txt')).text();
console.log('robots.txt served:', JSON.stringify(robots.split('\n').filter(Boolean).slice(0, 5)));
const ogpng = await fetch(BASE + '/og/quantiviq-og.png');
const buf = Buffer.from(await ogpng.arrayBuffer());
console.log('og png:', ogpng.status, buf.length + 'B', buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a' ? 'valid' : 'INVALID');
console.log(fail === 0 ? 'OG MATRIX: ALL PASS' : `OG MATRIX: ${fail} FAIL`);
