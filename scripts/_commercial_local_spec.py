import asyncio, json
from playwright.async_api import async_playwright

BASE = 'http://127.0.0.1:3111'
PASSED = []
FAILED = []

def check(name, cond):
    (PASSED if cond else FAILED).append(name)
    print(('PASS ' if cond else 'FAIL ') + name)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        ctx = await b.new_context(viewport={'width': 1366, 'height': 900}, locale='en-US')
        pg = await ctx.new_page()

        # 1 catalog EN: 40 cards, search works, filter works
        await pg.goto(BASE + '/en/solutions', wait_until='domcontentloaded')
        await pg.wait_for_timeout(1500)
        cards = await pg.locator('.sol-card').count()
        check('catalog EN shows 40 cards', cards == 40)
        await pg.fill('.sol-search input', 'quotation')
        await pg.wait_for_timeout(600)
        filtered = await pg.locator('.sol-card').count()
        check('search quotation filters to QuoteDesk-ish set (1-3)', 1 <= filtered <= 3)
        await pg.fill('.sol-search input', '')
        await pg.click('.sol-chip:has-text("Finance")')
        await pg.wait_for_timeout(600)
        fin = await pg.locator('.sol-card').count()
        check('category filter Finance = 7', fin == 7)

        # 2 detail EN flagship + CTA
        await pg.goto(BASE + '/en/solutions/quote-desk', wait_until='domcontentloaded')
        check('flagship detail has Request CTA', await pg.locator('a:has-text("Request This Solution")').count() >= 1)
        check('flagship detail has FAQ', await pg.locator('.sol-faq details').count() >= 2)
        check('flagship detail noindex absent (indexable)', 'noindex' not in (await pg.content()))

        # 3 scoping detail is noindex
        resp = await pg.goto(BASE + '/en/solutions/lead-qualification', wait_until='domcontentloaded')
        meta = await pg.content()
        check('scoping detail carries noindex', 'noindex' in meta)

        # 4 request form: invalid then valid
        await pg.goto(BASE + '/en/solutions/quote-desk/request', wait_until='domcontentloaded')
        check('request form locks solution', 'QuoteDesk' in (await pg.locator('.sol-selected').inner_text()))
        await pg.click('.sol-submit')
        await pg.wait_for_timeout(700)
        check('invalid submit blocked with errors', await pg.locator('.sol-field .err').count() >= 1)
        await pg.fill('.sol-field:nth-of-type(1) input', 'Local Test Buyer') if False else None
        # fill by label position (selected banner is above fields)
        inputs = pg.locator('form .sol-field input[type="text"], form .sol-field input[type="email"], form .sol-field input:not([type])')
        await pg.locator('form .sol-field:has-text("Your name") input').first.fill('Local Test Buyer')
        await pg.locator('form .sol-field:has-text("Work email") input').first.fill('buyer@example.org')
        await pg.locator('form .sol-field:has-text("Company") input').first.fill('Example Distribution Co')
        await pg.locator('form .sol-field:has-text("Phone") input').first.fill('+98 21 5555 0000')
        await pg.locator('form textarea').fill('We need faster quotations for wholesale buyers.')
        await pg.check('.sol-consent input')
        await pg.click('.sol-submit')
        await pg.wait_for_timeout(2500)
        confirm = await pg.locator('.sol-confirm').count()
        check('valid request shows confirmation', confirm == 1)
        ref = await pg.locator('.sol-confirm .ref').inner_text() if confirm else ''
        print('reference:', ref)

        # 5 FA request flow
        pg2 = await ctx.new_page()
        await pg2.goto(BASE + '/fa/solutions/quote-desk/request', wait_until='domcontentloaded')
        check('FA form shows FA CTA copy', 'ثبت درخواست' in (await pg2.content()))
        await pg2.locator('form .sol-field:has-text("نام") input').first.fill('خریدار آزمایشی')
        await pg2.locator('form .sol-field:has-text("ایمیل") input').first.fill('fa-buyer@example.org')
        await pg2.locator('form .sol-field:has-text("شرکت") input').first.fill('شرکت نمونه پخش')
        await pg2.check('.sol-consent input')
        await pg2.click('.sol-submit')
        await pg2.wait_for_timeout(2500)
        check('FA confirmation exact owner copy', 'درخواست شما ثبت شد. برای بررسی نیاز سازمان و ارائه پیشنهاد اختصاصی با شما ارتباط می‌گیریم.' in (await pg2.content()))

        # 6 finder
        await pg.goto(BASE + '/en/solutions/find', wait_until='domcontentloaded')
        await pg.click('.opt-btn:has-text("Recover cash")') if False else None
        await pg.locator('.sol-q').nth(0).locator('button:has-text("cash")').first.click()
        await pg.locator('.sol-q').nth(2).locator('button:has-text("Distribution")').first.click()
        await pg.click('.sol-submit')
        await pg.wait_for_timeout(800)
        check('finder yields results with why-matches', await pg.locator('.sol-finder-results .sol-card').count() >= 1 and await pg.locator('.sol-why').count() >= 1)

        # 7 homepage carousel present, keyboard buttons exist
        await pg.goto(BASE + '/en', wait_until='domcontentloaded')
        await pg.wait_for_timeout(1200)
        check('homepage carousel renders 8 flagship cards', await pg.locator('.sol-carousel .sol-card').count() == 8)
        check('carousel nav buttons present', await pg.locator('.sol-carousel-nav button').count() == 2)

        # 8 article bridge
        await pg.goto(BASE + '/en/insights/human-in-the-loop-vs-human-on-the-loop', wait_until='domcontentloaded')
        check('article bridge panel present', await pg.locator('.sol-bridge').count() == 1)
        check('bridge links QuoteDesk (registry-driven)', 'quote-desk' in (await pg.locator('.sol-bridge a').first.get_attribute('href') or ''))

        # 9 admin API denies without token
        resp = await ctx.request.get(BASE + '/api/admin/requests')
        check('admin API 401 without token', resp.status == 401)

        # 10 legacy contact form still renders (regression gate)
        await pg.goto(BASE + '/en/contact', wait_until='domcontentloaded')
        check('legacy contact form present', await pg.locator('.lead-form').count() == 1)

        await b.close()
        print('---')
        print('PASSED:', len(PASSED), 'FAILED:', len(FAILED))
        if FAILED: print('FAILED LIST:', FAILED)

asyncio.run(main())