import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )
        context = await browser.new_context()
        context.set_default_timeout(15000)
        page = await context.new_page()
        # -> navigate
        await page.goto("http://localhost:7420/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Navigate to http://localhost:7420/session/example-session and then inspect the page for generation progress logs and a preview area.
        await page.goto("http://localhost:7420/session/example-session")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Test blocked (AST guard fallback)
        raise AssertionError("Test blocked during agent run: " + "TEST BLOCKED The session dashboard could not be inspected because the session page did not render \u2014 the page shows 'Session not found'. Observations: - The page displays the text 'Session not found' and no dashboard content is present. - There are 0 interactive elements and no visible generation progress logs or preview area to verify.")
        await asyncio.sleep(5)
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    