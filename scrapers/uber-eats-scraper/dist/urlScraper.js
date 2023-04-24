"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const promises_1 = __importDefault(require("fs/promises"));
async function scrapeUrls(url) {
    const browser = await playwright_1.chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);
    console.log("Page loaded");
    try {
        await page.getByTestId('close-button').click({ timeout: 5000 });
    }
    catch (error) {
        console.log("Close button not found or not needed");
    }
    try {
        await page.getByRole('button', { name: 'Opt out' }).click({ timeout: 5000 });
    }
    catch (error) {
        console.log("Opt-out button not found or not needed");
    }
    const storeCards = await page.$$('data-testid=store-card');
    const links = [];
    for (const storeCard of storeCards) {
        const href = await storeCard.getAttribute('href');
        if (href) {
            links.push("https://www.ubereats.com" + href);
        }
    }
    console.log(links);
    const fileName = 'scraped_urls.txt';
    try {
        for await (const link of links) {
            try {
                promises_1.default.appendFile(fileName, `${link}\n`);
            }
            catch (jsonError) {
                console.error('Error parsing JSON data:', jsonError);
            }
        }
    }
    catch (error) {
        console.error('Error reading or writing the file:', error);
    }
    await context.close();
    await browser.close();
}
async function main() {
    await scrapeUrls('https://www.ubereats.com/feed?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMk5ZVSUyMFN0ZXJuJTIwU2Nob29sJTIwb2YlMjBCdXNpbmVzcyUyMiUyQyUyMnJlZmVyZW5jZSUyMiUzQSUyMkNoSUo1Uk40UVpCWndva1JWa1RyY0FMUUtqcyUyMiUyQyUyMnJlZmVyZW5jZVR5cGUlMjIlM0ElMjJnb29nbGVfcGxhY2VzJTIyJTJDJTIybGF0aXR1ZGUlMjIlM0E0MC43MjkxMDAyJTJDJTIybG9uZ2l0dWRlJTIyJTNBLTczLjk5NjI1MTMlN0Q%3D&ps=1');
}
main();
