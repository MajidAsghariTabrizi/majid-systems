import asyncio, sys
from playwright.async_api import async_playwright

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
BASE = 'https://quantiviq.xyz'

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        ctx = await b.new_context(user_agent=UA, viewport={'width': 1512, 'height': 982}, locale='en-US')
        pg = await ctx.new_page()
        sends = []
        pg.on('request', lambda r: sends.append(r.url) if '/_q/api/send' in r.url else None)
        # F3: article with REAL progressive scroll + 32s margin
        await pg.goto(BASE + '/en/insights/human-in-the-loop-vs-human-on-the-loop', wait_until='load')
        await pg.wait_for_timeout(2000)
        for frac in (0.3, 0.5, 0.6, 0.75):
            await pg.evaluate('f => window.scrollTo({top: document.body.scrollHeight * f, behavior: "instant"})', frac)
            await pg.wait_for_timeout(900)
        print('scrolled; waiting 31s dwell margin')
        await pg.wait_for_timeout(31000)
        print('sends after article:', len(sends))
        # F4: explore — click the first SCENARIO chip specifically (.role-chip)
        await pg.goto(BASE + '/en/explore', wait_until='load')
        await pg.wait_for_timeout(4000)
        chip = pg.locator('button.role-chip, .role-row button').first
        await chip.click(timeout=10000)
        await pg.wait_for_timeout(6000)
        print('sends after explore click:', len(sends), '| url:', pg.url)
        await b.close()
        for s in sends: print('SEND', s[:60])

asyncio.run(main())