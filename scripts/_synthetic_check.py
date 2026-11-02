import asyncio
from playwright.async_api import async_playwright

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        ctx = await b.new_context(user_agent=UA, viewport={'width': 1512, 'height': 982}, locale='en-US')
        pg = await ctx.new_page()
        await pg.goto('https://quantiviq.xyz/en', wait_until='domcontentloaded')
        await pg.wait_for_timeout(6000)
        await pg.goto('https://quantiviq.xyz/en/about', wait_until='domcontentloaded')
        await pg.wait_for_timeout(6000)
        print('SYNTHETIC_TEST_DONE 1512x982 /en + /en/about')
        await b.close()

asyncio.run(main())