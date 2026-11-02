import asyncio, sys
from playwright.async_api import async_playwright
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        ctx = await b.new_context(user_agent=UA, viewport={'width': 1512, 'height': 982}, locale='en-US')
        pg = await ctx.new_page()
        sends = []
        pg.on('request', lambda r: sends.append(r.url) if '/_q/api/send' in r.url else None)
        await pg.goto('https://quantiviq.xyz/en/solutions', wait_until='load')
        await pg.wait_for_timeout(3500)
        print('catalog sends:', len(sends))
        await pg.goto('https://quantiviq.xyz/en/solutions/quote-desk/request', wait_until='load')
        await pg.locator('form .sol-field:has-text("Your name") input').first.fill('AGENT E2E TEST')
        await pg.locator('form .sol-field:has-text("Work email") input').first.fill('agent-e2e@quantiviq.xyz')
        await pg.locator('form .sol-field:has-text("Company") input').first.fill('Quantiviq Release Verification')
        await pg.locator('form textarea').fill('LABELED SYNTHETIC RELEASE TEST for commercial platform v2. Safe to archive.')
        await pg.check('.sol-consent input')
        await pg.click('.sol-submit')
        await pg.wait_for_timeout(4000)
        ok = await pg.locator('.sol-confirm').count() == 1
        ref = ''
        if ok: ref = (await pg.locator('.sol-confirm .ref').inner_text()).strip()
        print('PROD confirm:', ok, '| ref:', ref)
        # FA homepage carousel + article bridge + finder spot checks
        await pg.goto('https://quantiviq.xyz/fa', wait_until='load'); await pg.wait_for_timeout(1500)
        print('FA carousel cards:', await pg.locator('.sol-carousel .sol-card').count())
        await pg.goto('https://quantiviq.xyz/fa/insights/the-real-cost-of-enterprise-ai-agents', wait_until='load')
        print('FA article bridge:', await pg.locator('.sol-bridge').count())
        await pg.goto('https://quantiviq.xyz/en/solutions/find', wait_until='load'); await pg.wait_for_timeout(800)
        await pg.locator('.sol-q').nth(0).locator('button:has-text("knowledge")').first.click()
        await pg.locator('.sol-q').nth(2).locator('button:has-text("Larger enterprise")').first.click()
        await pg.click('.sol-submit'); await pg.wait_for_timeout(900)
        print('finder prod results:', await pg.locator('.sol-finder-results .sol-card').count())
        await b.close()
asyncio.run(main())