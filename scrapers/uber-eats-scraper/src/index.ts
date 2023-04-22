import { chromium } from "playwright";
import fs from 'fs/promises';

(async () => {
  // Setup
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.ubereats.com/store/mcdonalds-les-delancey-st/s5KzcRQfTUykmnFxWXF49Q");
  console.log("Page loaded");

  try {
    await page.getByTestId('close-button').click();
  } catch (error) {
    console.log("Close button not found or not needed");
  }

  try {
    await page.getByRole('button', { name: 'Opt out' }).click();
  } catch (error) {
    console.log("Opt-out button not found or not needed");
  }

  const store_name = await page.getByTestId('store-title-summary').innerText();
  console.log(store_name);

  await page.getByRole('link', { name: 'More info' }).click();
  const store_address = await page.getByRole('button', { name: 'Copy' }).innerText();
  await page.getByTestId('close-button').click();
  console.log(store_address);

  const rating = await page.getByText('4.6 (500+ ratings) • American • $').innerText();
  console.log(rating);

  const menu_items = await page.getByRole('list').allTextContents();
  console.log(menu_items);

  // Save scraped data to a JSON file
  const scrapedData = {
    store_name,
    store_address,
    rating,
    menu_items
  };

  const fileName = 'scraped_data.json';

  try {
    const fileContent = await fs.readFile(fileName, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    jsonData.push(scrapedData);
    await fs.writeFile(fileName, JSON.stringify(jsonData, null, 2));
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, create a new file with the scraped data as the first item
      await fs.writeFile(fileName, JSON.stringify([scrapedData], null, 2));
    } else {
      console.error('Error reading or writing the file:', error);
    }
  }

  console.log('Scraped data saved to', fileName);

  // Teardown
  await context.close();
  await browser.close();
})();
