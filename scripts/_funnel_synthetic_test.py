import asyncio, sys
from playwright.async_api import async_playwright

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
BASE = 'https://quantiviq.xyz'

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        ctx = await b.new_context(user_agent=UA, viewport={'width': 1512, 'height': 982}, locale='en-US')
        pg = await ctx.new_page()
        # F2: homepage -> Mind chat -> contact click
        await pg.goto(BASE + '/en', wait_until='domcontentloaded')
        await pg.wait_for_timeout(4000)
        await pg.goto(BASE + '/en/mind', wait_until='domcontentloaded')
        await pg.wait_for_timeout(3500)
        await pg.locator('textarea').first.fill('What is the difference between AI adoption and AI transformation?')
        await pg.keyboard.press('Enter')
        await pg.wait_for_timeout(10000)
        print('mind chat done')
        # contact click: nav link to contact
        link = pg.locator('a[href*="contact"]').first
        try:
            await link.click(timeout=8000)
            await pg.wait_for_timeout(3000)
            print('contact clicked ->', pg.url)
        except Exception as e:
            print('contact click fallback:', str(e)[:60])
            await pg.goto(BASE + '/en/contact', wait_until='domcontentloaded')
            await pg.wait_for_timeout(3000)
        # FAILED FORM PATH: invalid submit (empty required fields)
        try:
            btn = pg.locator('button[type="submit"]').first
            await btn.click(timeout=6000)
            await pg.wait_for_timeout(3000)
            print('invalid form submitted (should NOT fire contact_submit_success)')
        except Exception as e:
            print('form attempt err:', str(e)[:60])
        # F3: insight read
        await pg.goto(BASE + '/en/insights/human-in-the-loop-vs-human-on-the-loop', wait_until='domcontentloaded')
        await pg.evaluate('window.scrollTo(0, document.body.scrollHeight * 0.7)')
        await pg.wait_for_timeout(26000)
        print('article dwell done')
        # F4: explore simulator
        await pg.goto(BASE + '/en/explore', wait_until='domcontentloaded')
        await pg.wait_for_timeout(3500)
        try:
            await pg.locator('button.chip-btn, [role="group"] button').first.click(timeout=8000)
            await pg.wait_for_timeout(3000)
            print('simulator scenario clicked')
        except Exception as e:
            print('sim click err:', str(e)[:80])
        await b.close()

asyncio.run(main())