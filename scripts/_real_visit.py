import asyncio, sys
from playwright.async_api import async_playwright

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        ctx = await b.new_context(user_agent=UA, viewport={'width': 1440, 'height': 900}, locale='en-US')
        pg = await ctx.new_page()
        for url in ['https://quantiviq.xyz/en', 'https://quantiviq.xyz/en/mind', 'https://quantiviq.xyz/en/insights', 'https://quantiviq.xyz/en/about']:
            await pg.goto(url, wait_until='domcontentloaded')
            await pg.wait_for_timeout(4000)
            print('visited', url)
        # a real Mind interaction -> mind_session_start + session
        await pg.goto('https://quantiviq.xyz/en/mind', wait_until='domcontentloaded')
        await pg.wait_for_timeout(3500)
        ta = pg.locator('textarea').first
        await ta.fill('What is the difference between AI adoption and AI transformation?')
        await pg.keyboard.press('Enter')
        await pg.wait_for_timeout(9000)
        body_txt = (await pg.locator('body').inner_text())[:80].replace(chr(10), ' ')
        print('mind answered:', body_txt)
        await b.close()

asyncio.run(main())