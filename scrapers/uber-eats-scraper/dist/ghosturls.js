"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const promises_1 = __importDefault(require("fs/promises"));
async function scrapeUrls(url) {
    const browser = await playwright_1.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);
    console.log("Page loaded");
    const store_link = await page.getByRole("link", { name: "Seoul City Wings" }).getAttribute('href');
    console.log(store_link);
    const storeCards = await page.$$('a.restaurant-card');
    const links = [];
    for (const storeCard of storeCards) {
        const href = await storeCard.getAttribute('href');
        if (href) {
            links.push("https://order.tryotter.com" + href);
        }
    }
    console.log(links);
    const fileName = 'scraped_ghost_urls.txt';
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
    await scrapeUrls('https://carnegiefoods.com/');
}
main();
