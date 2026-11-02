import asyncio
from playwright.async_api import async_playwright
BASE = 'http://127.0.0.1:3112'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        ctx = await b.new_context(viewport={'width': 320, 'height': 700}, locale='en-US')
        pg = await ctx.new_page()
        # CTA visible & in-viewport on request page at 320px
        await pg.goto(BASE + '/en/solutions/quote-desk/request', wait_until='load')
        await pg.wait_for_timeout(900)
        box = await pg.locator('.sol-submit').bounding_box()
        vw = 320
        print('submit_box=', box)
        print('submit_visible=', bool(box) and 0 <= box['x'] and box['x'] + box['width'] <= vw + 1 and box['width'] > 100)
        # detail hero gutters measured (first heading left/right offsets)
        await pg.goto(BASE + '/fa/solutions/quote-desk', wait_until='load')
        await pg.wait_for_timeout(800)
        gut = await pg.evaluate('''() => {
          const el = document.querySelector('.sol-detail h1');
          const r = el.getBoundingClientRect();
          return { right: Math.round(r.right), left: Math.round(r.left), vw: document.documentElement.clientWidth };
        }''')
        print('fa_detail_h1=', gut, 'gutter_ok=', gut['left'] >= 0 and gut['right'] <= gut['vw'])
        # finder options reachable without overlap at 320
        await pg.goto(BASE + '/en/solutions/find', wait_until='load')
        await pg.wait_for_timeout(800)
        n = await pg.locator('.opt-btn').count()
        vis = await pg.locator('.opt-btn').first.is_visible()
        print('finder_opts=', n, 'first_visible=', vis)
        await b.close()
asyncio.run(main())
