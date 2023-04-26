import { chromium } from "playwright";
import fs from 'fs/promises';

async function scrapeUrls(url: string) {
    // Setup
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url);
    console.log("Page loaded");

    try {
        await page.getByTestId('close-button').click({ timeout: 10_000 });
    } catch (error) {
        console.log("Close button not found or not needed");
    }

    try {
        await page.getByRole('button', { name: 'Opt out' }).click({ timeout: 5_000 });
    } catch (error) {
        console.log("Opt-out button not found or not needed");
    }

    

    // const store_link = await page.getByTestId('store-card').getAttribute('href');
    // console.log(store_link);

    const storeCards = await page.$$('data-testid=store-card');
    // Loop through each element and navigate to its page
    const links: string[] = [];

    for (const storeCard of storeCards) {
        const href = await storeCard.getAttribute('href');
        if (href) {
            links.push("https://www.ubereats.com" + href)
        }
    }

    console.log(links);

    const fileName = 'scraped_urls.txt';

    try {
        for await (const link of links) {
            try {
                // await fs.appendFile(fileName, JSON.stringify(link, null, 2));
                fs.appendFile(fileName, `${link}\n`);
            } catch (jsonError: any) {
                console.error('Error parsing JSON data:', jsonError);
            }
        }
    } catch (error: any) {
        console.error('Error reading or writing the file:', error);
    }

    // Teardown
    await context.close();
    await browser.close();
}

async function main() {
    await scrapeUrls('https://www.ubereats.com/feed?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMjEyMSUyME4lMjBMYSUyMFNhbGxlJTIwU3QlMjIlMkMlMjJyZWZlcmVuY2UlMjIlM0ElMjJkYzQ4NmEzMS02OGFmLTdkM2QtMDAzNS1jOTdlMTkyOGNiYmQlMjIlMkMlMjJyZWZlcmVuY2VUeXBlJTIyJTNBJTIydWJlcl9wbGFjZXMlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQTQxLjg4NjU4MSUyQyUyMmxvbmdpdHVkZSUyMiUzQS04Ny42MzE5MjMlN0Q%3D&ps=1');
    // Example URL you can paste above:
    // https://www.ubereats.com/feed?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMk5ZVSUyMFN0ZXJuJTIwU2Nob29sJTIwb2YlMjBCdXNpbmVzcyUyMiUyQyUyMnJlZmVyZW5jZSUyMiUzQSUyMkNoSUo1Uk40UVpCWndva1JWa1RyY0FMUUtqcyUyMiUyQyUyMnJlZmVyZW5jZVR5cGUlMjIlM0ElMjJnb29nbGVfcGxhY2VzJTIyJTJDJTIybGF0aXR1ZGUlMjIlM0E0MC43MjkxMDAyJTJDJTIybG9uZ2l0dWRlJTIyJTNBLTczLjk5NjI1MTMlN0Q%3D&ps=1
}

main();