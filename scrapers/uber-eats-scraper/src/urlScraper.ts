import { chromium } from "playwright";
import fs from 'fs/promises';

async function scrapeUrls(url: string) {
    // Setup
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url);
    console.log("Page loaded");

    try {
        await page.getByTestId('close-button').click();
    } catch (error) {
        console.log("Close button not found or not needed");
    }

    try {
        await page.getByRole('button', { name: 'Opt out' }).click({ timeout: 10_000 });
    } catch (error) {
        console.log("Opt-out button not found or not needed");
    }

    const store_link = await page.getByTestId('store-card').getAttribute('href');
    console.log(store_link);

    const storeCards = await page.$$('data-testid=store-card');

    // Loop through each element and navigate to its page
    const links: string[] = [];

    for (const storeCard of storeCards) {
        const href = await storeCard.getAttribute('href');
        if (href) {
            links.push(href)
        }
    }

    console.log(links);

    const fileName = 'scraped_urls.json';

    // try {
    //     const fileContent = await fs.readFile(fileName, 'utf-8');
    //     try {
    //         const jsonData = JSON.parse(fileContent);
    //         jsonData.push(scrapedData);
    //         await fs.writeFile(fileName, JSON.stringify(jsonData, null, 2));
    //     } catch (jsonError: any) {
    //         console.error('Error parsing JSON data:', jsonError);
    //         // If the JSON data is malformed, create a new file with the scraped data as the first item
    //         await fs.writeFile(fileName, JSON.stringify([scrapedData], null, 2));
    //     }
    // } catch (error: any) {
    //     if (error.code === 'ENOENT') {
    //         // If the file doesn't exist, create a new file with the scraped data as the first item
    //         await fs.writeFile(fileName, JSON.stringify([scrapedData], null, 2));
    //     } else {
    //         console.error('Error reading or writing the file:', error);
    //     }
    // }

    // Teardown
    await context.close();
    await browser.close();
}

async function main() {
    await scrapeUrls('https://www.ubereats.com/feed?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMjM0NiUyMEUlMjAxM3RoJTIwU3QlMjIlMkMlMjJyZWZlcmVuY2UlMjIlM0ElMjJhMjQ2NWI4Ny1jOGJiLTEzOTUtMGY0ZS0zOWRjNzkxZTA5NzklMjIlMkMlMjJyZWZlcmVuY2VUeXBlJTIyJTNBJTIydWJlcl9wbGFjZXMlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQTQwLjczMDc1MiUyQyUyMmxvbmdpdHVkZSUyMiUzQS03My45ODM4NjglN0Q%3D');
}

main();