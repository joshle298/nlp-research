"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const promises_1 = __importDefault(require("fs/promises"));
const promises_2 = require("fs/promises");
async function scrapeRestaurant(url) {
    const browser = await playwright_1.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);
    console.log("Page loaded");
    try {
        await page.getByTestId("close-button").click();
    }
    catch (error) {
        console.log("Close button not found or not needed");
    }
    try {
        await page
            .getByRole("button", { name: "Opt out" })
            .click({ timeout: 10000 });
    }
    catch (error) {
        console.log("Opt-out button not found or not needed");
    }
    const store_name = await page.getByTestId("store-title-summary").innerText();
    console.log(store_name);
    await page.getByRole("link", { name: "More info" }).click();
    const store_address = await page
        .getByRole("button", { name: "Copy" })
        .innerText();
    await page.getByTestId("close-button").click();
    console.log(store_address);
    const menu_items = await page.getByRole("listitem").allTextContents();
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
        ""
    ];
    scrapedData.menu_items = scrapedData.menu_items.map((item) => item.replace(/Quick view/g, ''));
    scrapedData.menu_items = scrapedData.menu_items.filter((item) => !forbidden.includes(item));
    const fileName = "scraped_data_josh.json";
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
        const data = await (0, promises_2.readFile)("scraped_urls.txt", "utf-8");
        const restaurantURLs = data.split("\n");
        for (const restaurant of restaurantURLs) {
            await scrapeRestaurant(restaurant);
        }
        console.log("Scraping completed");
    }
    catch (err) {
        console.error("Error during scraping:", err);
    }
}
main();
