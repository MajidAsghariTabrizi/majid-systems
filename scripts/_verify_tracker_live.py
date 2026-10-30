import asyncio, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        pg = await b.new_page()
        reqs = []
        pg.on('request', lambda r: reqs.append(r.url) if '/_q/' in r.url else None)
        await pg.goto('https://quantiviq.xyz/en', wait_until='networkidle')
        tag = await pg.evaluate("() => { const s = document.querySelector('script[src*=\"/_q/\"]'); return s ? {src: s.getAttribute('src'), wid: s.getAttribute('data-website-id')} : null }")
        print('TAG:', tag)
        await pg.wait_for_timeout(2500)
        print('REQS:', [u for u in reqs])
        # emit a custom event to test taxonomy path
        ok = await pg.evaluate("() => { if (window.umami && window.umami.track) { window.umami.track('insight_read', {slug:'probe-live', locale:'en'}); return 'sent' } return 'no-umami' }")
        print('EVENT:', ok)
        await pg.wait_for_timeout(2000)
        print('REQS2:', [u for u in reqs])
        # mind page: check SSR block exists
        await pg.goto('https://quantiviq.xyz/en/mind', wait_until='domcontentloaded')
        txt = await pg.evaluate("() => document.querySelector('.mind-seo') ? document.querySelector('.mind-seo').innerText.length : -1")
        print('MIND_SEO_CHARS:', txt)
        await b.close()

asyncio.run(main())