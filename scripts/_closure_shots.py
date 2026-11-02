import asyncio, os
from playwright.async_api import async_playwright
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
os.makedirs(r'docs\commercial\shots', exist_ok=True)
BASE = 'http://127.0.0.1:3112'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        for name, vw, vh in [('desktop', 1366, 900), ('m390', 390, 844), ('m320', 320, 700)]:
            ctx = await b.new_context(user_agent=UA, viewport={'width': vw, 'height': vh}, locale='en-US')
            pg = await ctx.new_page()
            for route, tag in [('/en/solutions', 'catalog_en'), ('/fa/solutions', 'catalog_fa'),
                               ('/en/solutions/quote-desk', 'detail_en'), ('/fa/solutions/quote-desk', 'detail_fa'),
                               ('/en/solutions/find', 'finder_en'), ('/fa/solutions/quote-desk/request', 'request_fa')]:
                await pg.goto(BASE + route, wait_until='load')
                await pg.wait_for_timeout(1600)
                await pg.screenshot(path=f'docs/commercial/shots/{tag}_{name}.png', full_page=(name == 'desktop'))
            await ctx.close()
        await b.close()
        print('done:', len(os.listdir(r'docs\commercial\shots')))
asyncio.run(main())
