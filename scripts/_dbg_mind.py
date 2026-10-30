import asyncio, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        pg = await b.new_page()
        errs = []
        pg.on('console', lambda m: errs.append(m.type + ': ' + m.text[:160]) if m.type in ('error','warning') else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR: ' + str(e)[:200]))
        r = await pg.goto('https://quantiviq.xyz/en/mind', wait_until='domcontentloaded')
        print('STATUS:', r.status)
        await pg.wait_for_timeout(5000)
        ta = await pg.locator('textarea').count()
        print('TEXTAREAS:', ta)
        print('ERRORS:', errs[:8])
        snippet = (await pg.locator('body').inner_text())[:220].replace(chr(10), ' | ')
        print('BODY:', snippet)
        await b.close()

asyncio.run(main())