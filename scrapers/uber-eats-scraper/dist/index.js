"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const promises_1 = __importDefault(require("fs/promises"));
const restaurantURLs = [
    "https://www.ubereats.com/store/cava-143-4th-ave/pllgMnkiTtuxE_DQ-op_nA?diningMode=DELIVERY",
    "https://www.ubereats.com/store/smashed/sFwAEStgQL22MeQSv4NQ4g?diningMode=DELIVERY",
    "https://www.ubereats.com/store/evas-health/cdl5Avc5WYq_W5nDIQwaYA?diningMode=DELIVERY",
    "https://www.ubereats.com/store/flowers-cafe/KJpvvJI1TLGJMqEcOfSrnA?diningMode=DELIVERY",
    "https://www.ubereats.com/store/gyu-don-gyu-taro/mkgC1wB7XtmKil5Bj9iNwg",
];
(async () => {
    const browser = await playwright_1.chromium.launch({ headless: false });
    for (let i = 0; i < restaurantURLs.length; i++) {
        try {
            var context = await browser.newContext();
            var page = await context.newPage();
            console.log(restaurantURLs[i]);
            await page.goto(restaurantURLs[i]);
            console.log("Page loaded");
            try {
                await page.getByTestId('close-button').click();
            }
            catch (error) {
                console.log("Close button not found or not needed");
            }
            try {
                await page.getByRole('button', { name: 'Opt out' }).click();
            }
            catch (error) {
                console.log("Opt-out button not found or not needed");
            }
            var store_name = await page.getByTestId('store-title-summary').innerText();
            console.log(store_name);
            await page.getByRole('link', { name: 'More info' }).click();
            var store_address = await page.getByRole('button', { name: 'Copy' }).innerText();
            await page.getByTestId('close-button').click();
            console.log(store_address);
            const text = await page.getByText(/\d\.\d\s\(\d+[\+]*\s?ratings?\)\s\W\s[A-Za-z]+(?:\s?[A-Za-z]+)*\s\W\s\$/).innerText();
            const regex = /(\d\.\d)\s\((\d+[\+]*\s?ratings?)\)\s\W\s([A-Za-z]+(?:\s?[A-Za-z]+)*)\s\W\s\$/;
            var match = text.match(regex);
            var rating = "";
            if (match) {
                rating = match[1];
                const numOfRatings = match[2];
                const cuisineType = match[3];
                console.log(`Rating: ${rating}`);
            }
            else {
                console.log('No match found.');
            }
            var menu_items = await page.getByRole('list').allTextContents();
            console.log(menu_items);
            var scrapedData = {
                store_name,
                store_address,
                rating,
                menu_items
            };
            const fileName = 'uber_data.json';
            try {
                const fileContent = await promises_1.default.readFile(fileName, 'utf-8');
                try {
                    var jsonData = JSON.parse(fileContent);
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
            console.log(i);
        }
        catch (error) {
            console.error(`Error occurred during iteration ${i}:`, error);
        }
    }
    await browser.close();
})();
