"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
(async () => {
    const browser = await playwright_1.chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://www.ubereats.com/store/mcdonalds-les-delancey-st/s5KzcRQfTUykmnFxWXF49Q?diningMode=DELIVERY");
    console.log("Page loaded");
    await page.getByTestId('close-button').click();
    await page.getByRole('button', { name: 'Opt out' }).click();
    const store_name = await page.getByTestId('store-title-summary').innerText();
    console.log(store_name);
    await page.pause();
    await context.close();
    await browser.close();
})();
