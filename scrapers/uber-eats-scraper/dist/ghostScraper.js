"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const promises_1 = __importDefault(require("fs/promises"));
const promises_2 = require("fs/promises");
async function scrapeRestaurant(url) {
    const browser = await playwright_1.chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);
    console.log("Page loaded");
    const store_name = await page.getByTestId('ck-store-text').innerText();
    console.log(store_name);
    var store_address = await page.getByTestId('pickup-location').innerText();
    store_address = store_address.replace('Pickup at:\n', '');
    const menu_items = await page.getByTestId('csds-text').allTextContents();
    var scrapedData = {
        store_name,
        store_address,
        menu_items,
    };
    const forbidden = [
        "Get Help",
        "Buy gift cards",
        "Add your restaurant",
        "Sign up to deliver",
        "Create a business account",
        "Promotions",
        "Restaurants near me",
        "View all cities",
        "View all countries",
        "Pickup near me",
        "About Uber Eats",
        "English",
        "United States",
        "California",
        "Los Angeles",
        "Westlake",
        "Downtown",
        "",
        "Open",
        "More info",
        "When:",
        "Pickup at:",
        "Powered by",
        "DollinsFoodHall ©2022. All Rights Reserved.",
        "Terms of Service",
        "Privacy Policy"
    ];
    scrapedData.menu_items = scrapedData.menu_items.map((item) => item.replace(/\d\d-\d\d min/g, ''));
    scrapedData.menu_items = scrapedData.menu_items.filter((item) => !forbidden.includes(item));
    scrapedData.menu_items = scrapedData.menu_items.filter((item) => item.replace(store_address, ''));
    const fileName = "scraped_ghost_data.json";
    try {
        const fileContent = await promises_1.default.readFile(fileName, "utf-8");
        try {
            const jsonData = JSON.parse(fileContent);
            jsonData.push(scrapedData);
            await promises_1.default.writeFile(fileName, JSON.stringify(jsonData, null, 2));
        }
        catch (jsonError) {
            console.error("Error parsing JSON data:", jsonError);
            await promises_1.default.writeFile(fileName, JSON.stringify([scrapedData], null, 2));
        }
    }
    catch (error) {
        if (error.code === "ENOENT") {
            await promises_1.default.writeFile(fileName, JSON.stringify([scrapedData], null, 2));
        }
        else {
            console.error("Error reading or writing the file:", error);
        }
    }
    await context.close();
    await browser.close();
}
async function main() {
    try {
        const data = await (0, promises_2.readFile)("scraped_ghost_urls.txt", "utf-8");
        const restaurantURLs = data.split("\n");
        for (var restaurant of restaurantURLs) {
            await scrapeRestaurant(restaurant);
        }
        console.log("Scraping completed");
    }
    catch (err) {
        console.error("Error during scraping:", err);
    }
}
main();
