"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
async function scrapeUrls(url) {
    const browser = await playwright_1.chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);
    console.log("Page loaded");
    try {
        await page.getByTestId('close-button').click();
    }
    catch (error) {
        console.log("Close button not found or not needed");
    }
    try {
        await page.getByRole('button', { name: 'Opt out' }).click({ timeout: 10000 });
    }
    catch (error) {
        console.log("Opt-out button not found or not needed");
    }
    const store_link = await page.getByTestId('store-card').getAttribute('href');
    console.log(store_link);
    const storeCards = await page.$$('data-testid=store-card');
    const links = [];
    for (const storeCard of storeCards) {
        const href = await storeCard.getAttribute('href');
        if (href) {
            links.push(href);
        }
    }
    console.log(links);
    const fileName = 'scraped_urls.json';
    await context.close();
    await browser.close();
}
async function main() {
    await scrapeUrls('https://www.ubereats.com/feed?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMjM0NiUyMEUlMjAxM3RoJTIwU3QlMjIlMkMlMjJyZWZlcmVuY2UlMjIlM0ElMjJhMjQ2NWI4Ny1jOGJiLTEzOTUtMGY0ZS0zOWRjNzkxZTA5NzklMjIlMkMlMjJyZWZlcmVuY2VUeXBlJTIyJTNBJTIydWJlcl9wbGFjZXMlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQTQwLjczMDc1MiUyQyUyMmxvbmdpdHVkZSUyMiUzQS03My45ODM4NjglN0Q%3D');
}
main();
