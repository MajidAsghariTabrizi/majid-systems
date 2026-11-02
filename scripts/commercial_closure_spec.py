#!/usr/bin/env python3
"""commercial_closure_spec.py - focused behavioral gate for the closure review.

Exit code 0 ONLY when every assertion passes. Assertion failures and
unexpected exceptions mark FAILED and exit non-zero. Use --prove-failing-gate
to run one deliberate false assertion and verify the gate rejects it.

Runs against a local next start with isolated fixture storage and a mock
notification transport. No production systems, no real email, no real leads.
"""
import asyncio
import json
import sys

from playwright.async_api import async_playwright

BASE = 'http://127.0.0.1:3112'
ADMIN_TOKEN = 'test-token-0123456789abcdef'

PASSED, FAILED = [], []


def check(name, cond, detail=''):
    (PASSED if cond else FAILED).append(name)
    print(('PASS ' if cond else 'FAIL ') + name + ((' | ' + str(detail)[:150]) if (detail and not cond) else ''))


async def main():
    prove_gate = '--prove-failing-gate' in sys.argv
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        ctx = await b.new_context(viewport={'width': 1366, 'height': 900}, locale='en-US')
        page = await ctx.new_page()
        console_errors = []
        page.on('pageerror', lambda e: console_errors.append(str(e)))

        # 1. All 40 entries resolve in EN/FA (detail + request)
        await page.goto(BASE + '/en/solutions', wait_until='domcontentloaded')
        await page.wait_for_timeout(1200)
        ids = await page.eval_on_selector_all('.sol-card h3 a', 'els => els.map(e => e.getAttribute("href").split("/").pop())')
        ids = sorted(set(ids))
        check('catalog exposes 40 unique solutions', len(ids) == 40, len(ids))
        bad = []
        for sid in ids:
            for loc in ('en', 'fa'):
                for suffix in ('', '/request'):
                    r = await ctx.request.get(BASE + '/' + loc + '/solutions/' + sid + suffix)
                    if r.status != 200:
                        bad.append(loc + '/' + sid + suffix + '=' + str(r.status))
        check('all 40 x EN/FA detail+request routes resolve 200', not bad, bad[:6])
        r = await ctx.request.get(BASE + '/en/solutions')
        html = await r.text()
        check('catalog page indexable (no noindex)', 'noindex' not in html)
        for sid, expect_index in (('quote-desk', True), ('lead-qualification', False)):
            r = await ctx.request.get(BASE + '/en/solutions/' + sid)
            h = await r.text()
            has_noindex = 'noindex' in h
            check(sid + ' indexing policy correct (index=' + str(expect_index) + ')', has_noindex != expect_index)

        # 2. Persian conversion copy + related titles + a11y
        await page.goto(BASE + '/fa/solutions/quote-desk', wait_until='domcontentloaded')
        fa_html = await page.content()
        check('FA detail primary CTA exact copy', 'درخواست این راهکار' in fa_html)
        check('FA detail free of mojibake', ('\u00d8\u00b1\u00d8\u00a7' not in fa_html) and ('\u00c2\u00b7' not in fa_html))
        rel = await page.locator('.sol-related a').all_inner_texts()
        numbered = [x for x in rel if x[:2].isdigit()]
        check('related research labels are real titles (no numbered filenames)', not numbered, numbered[:3])

        await page.goto(BASE + '/en/solutions/quote-desk/request', wait_until='domcontentloaded')
        labels = await page.eval_on_selector_all('label[for]', 'els => els.map(e => e.getAttribute("for"))')
        for fid in ('sr-name', 'sr-email', 'sr-org', 'sr-phone', 'sr-need'):
            check('programmatic label for ' + fid, fid in labels)
        n0 = await page.locator('#sr-name').get_attribute('aria-invalid')
        await page.click('.sol-submit')
        await page.wait_for_timeout(400)
        n2 = await page.locator('#sr-name').get_attribute('aria-invalid')
        check('aria-invalid set after failed submit', n0 in (None, 'false') and n2 == 'true', str(n0) + '->' + str(n2))
        err_desc = await page.locator('#sr-name').get_attribute('aria-describedby')
        check('name input references its error', err_desc == 'err-name', err_desc)
        check('consent links localized privacy policy', '/en/privacy' in (await page.content()))
        phone_label = await page.locator('label[for="sr-phone"]').inner_text()
        check('single optional marker on phone label', phone_label.count('optional') == 1, phone_label)
        await page.fill('#sr-name', 'Kaya')
        await page.fill('#sr-email', 'bad-email')
        await page.click('.sol-submit')
        await page.wait_for_timeout(300)
        check('entered values preserved after failed submit', await page.input_value('#sr-name') == 'Kaya')

        # 3. Finder paths + semantics
        await page.goto(BASE + '/en/solutions/find', wait_until='domcontentloaded')
        pressed = await page.locator('.opt-btn[aria-pressed="true"]').count()
        await page.locator('.sol-q').nth(0).locator('button', has_text='Sell more').click()
        await page.locator('.sol-q').nth(1).locator('button', has_text='Quotations take too long').click()
        await page.locator('.sol-q').nth(2).locator('button', has_text='Distribution').click()
        pressed2 = await page.locator('.opt-btn[aria-pressed="true"]').count()
        check('finder options expose pressed state', pressed == 0 and pressed2 == 3, str(pressed) + '->' + str(pressed2))
        await page.click('.sol-submit')
        await page.wait_for_timeout(700)
        top = await page.locator('.sol-finder-results .sol-card h3 a').all_inner_texts()
        check('sales path suggests QuoteDesk first', 'QuoteDesk' in top[0], top[:3])
        badges = await page.locator('.sol-finder-results .sol-badge').all_inner_texts()
        check('finder results carry status badges', len(badges) >= 1 and all(bb in ('Detailed offering', 'Scoping engagement') for bb in badges), badges[:4])
        await page.locator('.sol-q').nth(0).locator('button', has_text='Keep and use').click()
        await page.wait_for_timeout(300)
        still = await page.locator('.opt-btn[aria-pressed="true"]').count()
        # outcome + business type stay selected; the outcome-scoped bottleneck must be cleared
        check('incompatible bottleneck cleared on outcome change', still == 2, still)
        for outcome, bottleneck, expect in (
            ('Protect and recover', 'Overdue receivables', 'Cash Recovery'),
            ('Run operations', 'Stock never matches', 'Inventory'),
            ('Serve customers', 'The phone never stops', 'Voice'),
            ('Keep and use', 'Knowledge is locked', 'Private Knowledge'),
        ):
            await page.locator('.sol-q').nth(0).locator('button', has_text=outcome).click()
            await page.locator('.sol-q').nth(1).locator('button', has_text=bottleneck).click()
            await page.click('.sol-submit')
            await page.wait_for_timeout(500)
            got = await page.locator('.sol-finder-results .sol-card h3 a').all_inner_texts()
            check('finder path [' + outcome + '] relevant', any(expect.lower() in g.lower() for g in got[:3]), got[:3])

        # 4. Persian search variants
        for variant in ('\u067e\u06cc\u0634 \u0641\u0627\u06a9\u062a\u0648\u0631', '\u067e\u06cc\u0634\u200c\u0641\u0627\u06a9\u062a\u0648\u0631', '\u067e\u06cc\u0634\u0641\u0627\u06a9\u062a\u0648\u0631'):
            await page.goto(BASE + '/fa/solutions', wait_until='domcontentloaded')
            await page.fill('.sol-search input', variant)
            await page.wait_for_timeout(500)
            titles = await page.locator('.sol-card h3 a').all_inner_texts()
            check('FA search variant finds QuoteDesk', any('\u067e\u06cc\u0634\u200c\u0641\u0627\u06a9\u062a\u0648\u0631' in t for t in titles), titles[:3])

        # 5. Request contract via API (fixture store + mock transport)
        async def post(body):
            r = await ctx.request.post(BASE + '/api/lead', data=json.dumps(body), headers={'content-type': 'application/json'})
            try:
                return r.status, await r.json()
            except Exception:
                return r.status, {}

        base_body = dict(intent='solution_request', locale='en', solution='quote-desk', source='solutions',
                         name='Closure Test', email='closure@example.org', org='Fixture Co',
                         preferred='email', consent=True, idempotencyKey='e2e-key-1')
        st, j = await post({**base_body, 'solution': ''})
        check('missing solution rejected precisely', st == 400 and j.get('errors', {}).get('solution') == 'required', (st, j))
        st, j = await post({**base_body, 'solution': 'does-not-exist'})
        check('unknown solution rejected', st == 400 and 'solution' in j.get('errors', {}), (st, j))
        st, j = await post({**base_body, 'org': ''})
        check('company required for solution_request', st == 400 and j.get('errors', {}).get('org') == 'required', (st, j))
        st, j = await post({**base_body, 'phone': '\u06f0\u06f9\u06f1\u06f2\u06f3\u06f4\u06f5\u06f6\u06f7\u06f8\u06f9', 'idempotencyKey': 'e2e-key-2'})
        check('Persian-digit phone accepted', st == 200 and j.get('ok') is True, (st, j))
        st2, j2 = await post({**base_body, 'phone': '\u06f0\u06f9\u06f1\u06f2\u06f3\u06f4\u06f5\u06f6\u06f7\u06f8\u06f9', 'idempotencyKey': 'e2e-key-2'})
        check('idempotent retry returns SAME reference', st2 == 200 and j2.get('id') == j.get('id') and j2.get('idempotentReplay') is True, (j.get('id'), j2.get('id')))
        st3, j3 = await post({**base_body, 'name': 'Different Person', 'idempotencyKey': 'e2e-key-2'})
        check('inconsistent key reuse rejected 409', st3 == 409, (st3, j3))
        st, j = await post({**base_body, 'source': 'utm_\u062c\u0630\u0627\u0628%!'})
        check('odd source normalized, never blocks inquiry', st == 200 and j.get('ok') is True, (st, j))

        await page.goto(BASE + '/en/solutions/omnichannel-sales/request', wait_until='domcontentloaded')
        await page.locator('form .sol-field:has-text("Your name") input').first.fill('UI Success Case')
        await page.locator('form .sol-field:has-text("Work email") input').first.fill('ui@example.org')
        await page.locator('form .sol-field:has-text("Company") input').first.fill('UI Co')
        await page.check('.sol-consent input')
        await page.click('.sol-submit')
        await page.wait_for_timeout(2500)
        confirm = await page.locator('.sol-confirm').count()
        ref = (await page.locator('.sol-confirm .ref').inner_text()) if confirm else ''
        check('UI success shows real QV reference', confirm == 1 and str(ref).startswith('QV-') and ref != 'QV-ignored', ref)
        for i in range(8):
            st, j = await post({**base_body, 'idempotencyKey': 'rl-' + str(i)})
        check('rate limit returns 429', st == 429, st)
        await page.goto(BASE + '/fa/solutions/quote-desk/request', wait_until='domcontentloaded')
        await page.locator('form .sol-field:has-text("\u0646\u0627\u0645") input').first.fill('\u062a\u0633\u062a \u0646\u0631\u062e')
        await page.locator('form .sol-field:has-text("\u0627\u06cc\u0645\u06cc\u0644") input').first.fill('rl@example.org')
        await page.locator('form .sol-field:has-text("\u0634\u0631\u06a9\u062a") input').first.fill('\u0634\u0631\u06a9\u062a \u062a\u0633\u062a')
        await page.check('.sol-consent input')
        await page.click('.sol-submit')
        await page.wait_for_timeout(2500)
        body_txt = await page.content()
        check('429 mapped to localized message', ('\u0632\u06cc\u0627\u062f' in body_txt and '\u0635\u0628\u0631' in body_txt))

        await page.goto(BASE + '/en/solutions/quote-desk/request', wait_until='domcontentloaded')
        await page.fill('#sr-need', 'short')
        await page.click('.sol-submit')
        await page.wait_for_timeout(300)
        check('invalid optional need gets precise error', await page.locator('#err-need').count() == 1)

        # 6. Admin path (fixture token)
        r = await ctx.request.get(BASE + '/api/admin/requests')
        check('admin unauthorized without token', r.status == 401)
        r = await ctx.request.get(BASE + '/api/admin/requests', headers={'x-admin-token': ADMIN_TOKEN})
        j = await r.json()
        check('admin authorized GET', r.status == 200 and j.get('ok') is True and j.get('summary', {}).get('total', 0) >= 2)
        rid = j['requests'][0]['id']
        r = await ctx.request.patch(BASE + '/api/admin/requests', headers={'x-admin-token': ADMIN_TOKEN, 'content-type': 'application/json'}, data=json.dumps({'id': rid, 'status': 'bogus'}))
        check('admin invalid status rejected', r.status == 400)
        r = await ctx.request.patch(BASE + '/api/admin/requests', headers={'x-admin-token': ADMIN_TOKEN, 'content-type': 'application/json'}, data=json.dumps({'id': rid, 'status': 'contacted'}))
        check('admin valid transition applied', r.status == 200 and (await r.json()).get('ok') is True)
        await page.goto(BASE + '/admin/requests', wait_until='domcontentloaded')
        check('admin console gates data before auth', await page.locator('table').count() == 0)

        # 7. Carousel interactions (click + keyboard + mobile swipe)
        await page.goto(BASE + '/en', wait_until='load')
        await page.wait_for_timeout(1500)
        track = page.locator('.sol-carousel .sol-track')
        x0 = await track.evaluate('el => el.scrollLeft')
        await page.locator('.sol-carousel-nav button').nth(1).click()
        await page.wait_for_timeout(600)
        x1 = await track.evaluate('el => el.scrollLeft')
        check('carousel next scrolls track', x1 != x0, (x0, x1))
        await page.locator('.sol-carousel-nav button').nth(0).click()
        await page.wait_for_timeout(600)
        x2 = await track.evaluate('el => el.scrollLeft')
        check('carousel prev scrolls back', x2 != x1, (x1, x2))
        await track.focus()
        await page.keyboard.press('ArrowRight')
        await page.wait_for_timeout(500)
        x3 = await track.evaluate('el => el.scrollLeft')
        check('carousel keyboard arrow works', x3 != x2, (x2, x3))
        mob = await b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True)
        mp = await mob.new_page()
        await mp.goto(BASE + '/en', wait_until='load')
        await mp.wait_for_timeout(1500)
        tr2 = mp.locator('.sol-carousel .sol-track')
        box = await tr2.bounding_box()
        if box:
            await mp.mouse.move(200, box['y'] + 20)
            await mp.mouse.down()
            for dx in range(0, 220, 30):
                await mp.mouse.move(200 - dx, box['y'] + 20)
            await mp.mouse.up()
            await mp.wait_for_timeout(600)
        mx = await tr2.evaluate('el => el.scrollLeft')
        check('carousel swipe scrolls on mobile viewport', mx > 0, mx)
        await mob.close()

        # 8. Legacy contact form behavior
        await page.goto(BASE + '/en/contact', wait_until='domcontentloaded')
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(500)
        check('legacy contact blocks empty submit', await page.locator('.lead-form .lead-error, .lead-form [aria-invalid="true"]').count() >= 1)

        # 9. Narrow screens: overflow + gutters + metadata + teaser
        for width in (320, 390):
            mctx = await b.new_context(viewport={'width': width, 'height': 800}, locale='en-US')
            mp2 = await mctx.new_page()
            for url in ('/fa/solutions', '/en/solutions/quote-desk', '/en/solutions/quote-desk/request', '/en/solutions/find'):
                await mp2.goto(BASE + url, wait_until='load')
                await mp2.wait_for_timeout(800)
                ov = await mp2.evaluate('() => ({ cw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth })')
                check('no horizontal overflow ' + str(width) + 'px ' + url, ov['sw'] <= ov['cw'] + 1, ov)
            await mctx.close()
        for url, frag in (('/en/solutions', 'Solutions'), ('/en/solutions/quote-desk', 'QuoteDesk'), ('/en/solutions/find', 'Find Your Solution'), ('/en/solutions/quote-desk/request', 'Request')):
            r = await ctx.request.get(BASE + url)
            h = await r.text()
            import re
            m = re.search('property=.og:title. content=.([^"<]*)', h)
            ogtitle = m.group(1) if m else ''
            check('og:title truthful for ' + url, bool(ogtitle) and frag in ogtitle and 'AI-native organization' not in ogtitle, ogtitle)
        await page.goto(BASE + '/en/solutions/quote-desk/request', wait_until='load')
        await page.wait_for_timeout(1000)
        check('assistant dock hidden on request route', await page.locator('.mind-dock').count() == 0)
        check('no page/hydration errors during run', not console_errors, console_errors[:3])

        if prove_gate:
            check('DELIBERATE FAIL: gate must exit non-zero', False)

        await b.close()

    print('-' * 60)
    print('PASSED: ' + str(len(PASSED)) + '  FAILED: ' + str(FAILED.__len__()))
    if FAILED:
        print('FAILED:')
        for f in FAILED:
            print('  - ' + f)
    return 0 if not FAILED else 1


if __name__ == '__main__':
    try:
        code = asyncio.run(main())
    except Exception as exc:
        import traceback
        traceback.print_exc()
        print('UNEXPECTED EXCEPTION: ' + str(exc))
        code = 1
    sys.exit(code)
