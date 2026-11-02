import asyncio
from playwright.async_api import async_playwright

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        ctx = await b.new_context(user_agent=UA, viewport={'width': 1512, 'height': 982}, locale='en-US')
        pg = await ctx.new_page()
        sends = []
        pg.on('request', lambda r: sends.append(r.url) if '/_q/api/send' in r.url else None)
        await pg.goto('https://quantiviq.xyz/en/explore', wait_until='load')
        await pg.wait_for_timeout(4000)
        scenario = pg.locator('section.explore-step').nth(1).locator('button').first
        txt = (await scenario.inner_text()).replace(chr(10), ' ')[:40]
        await scenario.click(timeout=10000)
        await pg.wait_for_timeout(6000)
        print('clicked scenario chip:', txt, '| sends:', len(sends))
        await b.close()

asyncio.run(main())