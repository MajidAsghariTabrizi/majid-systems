import asyncio, os
from playwright.async_api import async_playwright
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
os.makedirs(r'docs\commercial\shots', exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        for name, vw, vh in [('desktop', 1366, 900), ('mobile', 390, 844)]:
            ctx = await b.new_context(user_agent=UA, viewport={'width': vw, 'height': vh}, locale='en-US')
            pg = await ctx.new_page()
            await pg.goto('https://quantiviq.xyz/en/solutions', wait_until='load'); await pg.wait_for_timeout(1800)
            await pg.screenshot(path=f'docs/commercial/shots/catalog_en_{name}.png', full_page=(name=='desktop'))
            await pg.goto('https://quantiviq.xyz/fa/solutions', wait_until='load'); await pg.wait_for_timeout(1800)
            await pg.screenshot(path=f'docs/commercial/shots/catalog_fa_{name}.png', full_page=(name=='desktop'))
            await pg.goto('https://quantiviq.xyz/en/solutions/quote-desk', wait_until='load'); await pg.wait_for_timeout(1200)
            await pg.screenshot(path=f'docs/commercial/shots/detail_en_{name}.png')
            if name == 'desktop':
                await pg.goto('https://quantiviq.xyz/en', wait_until='load'); await pg.wait_for_timeout(2000)
                await pg.locator('.sol-carousel').scroll_into_view_if_needed(); await pg.wait_for_timeout(800)
                await pg.screenshot(path='docs/commercial/shots/home_carousel_en.png')
                await pg.goto('https://quantiviq.xyz/en/solutions/quote-desk/request', wait_until='load'); await pg.wait_for_timeout(800)
                await pg.screenshot(path='docs/commercial/shots/request_en.png')
            await ctx.close()
        await b.close()
        print('shots done:', sorted(os.listdir(r'docs\commercial\shots')))
asyncio.run(main())