import asyncio
from playwright.async_api import async_playwright
BASE = 'https://quantiviq.xyz'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        ctx = await b.new_context(viewport={'width': 1366, 'height': 900}, locale='en-US')
        pg = await ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        ok = lambda n, c: print(('PASS ' if c else 'FAIL ') + n)
        # 1 FA CTA exact + no mojibake
        await pg.goto(BASE + '/fa/solutions/quote-desk', wait_until='load')
        h = await pg.content()
        ok('prod FA CTA exact', 'درخواست این راهکار' in h)
        ok('prod FA no mojibake', ('Ø±Ø§Ù' not in h) and ('Â·' not in h))
        # 2 og:title truth
        import re
        for url, frag in [('/en/solutions', 'Solutions'), ('/en/solutions/quote-desk', 'QuoteDesk'), ('/en/solutions/find', 'Find Your Solution'), ('/en/solutions/quote-desk/request', 'Request')]:
            r = await ctx.request.get(BASE + url)
            h2 = await r.text()
            m = re.search('property=.og:title. content=.([^\"]*)', h2)
            ok('prod og:title ' + url, bool(m) and frag in m.group(1))
        # 3 FA search variants (client behavior on prod)
        await pg.goto(BASE + '/fa/solutions', wait_until='load'); await pg.wait_for_timeout(1500)
        await pg.fill('.sol-search input', 'پیش فاکتور')
        await pg.wait_for_timeout(600)
        t = await pg.locator('.sol-card h3 a').all_inner_texts()
        ok('prod FA search space-variant finds QuoteDesk', any('پیش‌فاکتور' in x for x in t))
        # 4 admin gate + console
        await pg.goto(BASE + '/admin/requests', wait_until='load')
        ok('prod admin console gates data', await pg.locator('table').count() == 0 and await pg.locator('#adm-token').count() == 1)
        r = await ctx.request.get(BASE + '/api/admin/requests')
        ok('prod admin API 401 without token', r.status == 401)
        # 5 mind dock hidden on request route
        await pg.goto(BASE + '/en/solutions/quote-desk/request', wait_until='load'); await pg.wait_for_timeout(1000)
        ok('prod mind dock hidden on request route', await pg.locator('.mind-dock').count() == 0)
        # 6 legacy contact intact
        await pg.goto(BASE + '/en/contact', wait_until='load')
        ok('prod legacy contact form present', await pg.locator('.lead-form').count() == 1)
        # 7 320px overflow on prod FA catalog + detail
        mctx = await b.new_context(viewport={'width': 320, 'height': 700})
        mp = await mctx.new_page()
        for u in ('/fa/solutions', '/en/solutions/quote-desk', '/en/solutions/find'):
            await mp.goto(BASE + u, wait_until='load'); await mp.wait_for_timeout(800)
            ov = await mp.evaluate('() => ({ cw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth })')
            ok('prod no overflow 320px ' + u, ov['sw'] <= ov['cw'] + 1)
        # 8 finder badges + bottleneck options localized on prod
        await pg.goto(BASE + '/en/solutions/find', wait_until='load'); await pg.wait_for_timeout(800)
        await pg.locator('.sol-q').nth(0).locator('button', has_text='Sell more').click(); await pg.wait_for_timeout(300)
        opts = await pg.locator('.sol-q').nth(1).locator('.opt-btn').all_inner_texts()
        ok('prod bottleneck options grouped by outcome', len(opts) >= 4)
        ok('no page errors on prod', not errs)
        await b.close()
asyncio.run(main())
