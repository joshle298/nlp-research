"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const promises_1 = __importDefault(require("fs/promises"));
const restaurantURLs = [
    "https://www.ubereats.com/store/juice-generation-prince-st/Wne4MfksREykJZbwkeh8Fg?diningMode=DELIVERY&ps=1",
    "https://www.ubereats.com/store/dallas-bbq-chelsea/EMA8iPP5TT-2yDC3sjWxMw?diningMode=DELIVERY",
    "https://www.ubereats.com/store/dig-union-square/5-KLz2H6QwqiU3h-9Unk1A?diningMode=DELIVERY",
];
async function scrapeRestaurant(url) {
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
    const store_name = await page.getByTestId('store-title-summary').innerText();
    console.log(store_name);
    await page.getByRole('link', { name: 'More info' }).click();
    const store_address = await page.getByRole('button', { name: 'Copy' }).innerText();
    await page.getByTestId('close-button').click();
    console.log(store_address);
    const text = await page.getByText(/\d\.\d\s\(\d+[\+]*\s?ratings?\)\s\W\s[A-Za-z]+(?:\s?[A-Za-z]+)*\s\W\s\$/).innerText();
    const regex = /(\d\.\d)\s\((\d+[\+]*\s?ratings?)\)\s\W\s([A-Za-z]+(?:\s?[A-Za-z]+)*)\s\W\s\$/;
    const match = text.match(regex);
    const rating = "";
    if (match) {
        const rating = match[1];
        const numOfRatings = match[2];
        const cuisineType = match[3];
        console.log(`Rating: ${rating}`);
    }
    else {
        console.log('No match found.');
    }
    const menu_items = await page.getByRole('list').allTextContents();
    console.log(menu_items);
    const scrapedData = {
        store_name,
        store_address,
        rating,
        menu_items
    };
    const fileName = 'scraped_data.json';
    try {
        const fileContent = await promises_1.default.readFile(fileName, 'utf-8');
        try {
            const jsonData = JSON.parse(fileContent);
            jsonData.push(scrapedData);
            await promises_1.default.writeFile(fileName, JSON.stringify(jsonData, null, 2));
        }
        catch (jsonError) {
            console.error('Error parsing JSON data:', jsonError);
            await promises_1.default.writeFile(fileName, JSON.stringify([scrapedData], null, 2));
        }
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            await promises_1.default.writeFile(fileName, JSON.stringify([scrapedData], null, 2));
        }
        else {
            console.error('Error reading or writing the file:', error);
        }
    }
    await context.close();
    await browser.close();
}
async function main() {
    for (const restaurant of restaurantURLs) {
        await scrapeRestaurant(restaurant);
    }
}
main();
