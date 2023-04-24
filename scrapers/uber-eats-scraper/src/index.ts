import { chromium } from "playwright";
import fs from 'fs/promises';
import { readFile } from 'fs/promises';

const restaurantURLs = [
    "https://www.ubereats.com/store/silverlake-ramen-south-pasadena-ca/cEcNQ8ePUi-3c6F98vnCYg?diningMode=DELIVERY",
    "https://www.ubereats.com/store/juice-generation-prince-st/Wne4MfksREykJZbwkeh8Fg?diningMode=DELIVERY&ps=1",
    "https://www.ubereats.com/store/dallas-bbq-chelsea/EMA8iPP5TT-2yDC3sjWxMw?diningMode=DELIVERY",
    "https://www.ubereats.com/store/dig-union-square/5-KLz2H6QwqiU3h-9Unk1A?diningMode=DELIVERY",
    "https://www.ubereats.com/store/shake-shack-west-village/yRfk0I6-Sdey3bUvG-IRTQ?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMjI4MSUyMEdyYW5kJTIwU3QlMjIlMkMlMjJyZWZlcmVuY2UlMjIlM0ElMjI4NGUzY2IzMC02OTQ0LTI1NWYtNTI4Ny04OWQzNzE2NTVhYTQlMjIlMkMlMjJyZWZlcmVuY2VUeXBlJTIyJTNBJTIydWJlcl9wbGFjZXMlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQTQwLjcxNzYzMTYlMkMlMjJsb25naXR1ZGUlMjIlM0EtNzMuOTkyNjkzMiU3RA%3D%3D&ps=1"
];

async function scrapeRestaurant(url: string) {
  // Setup
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(url);
  console.log("Page loaded");

  await page.pause();
  
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

  const store_name = await page.getByTestId('store-title-summary').innerText();
  console.log(store_name);

  await page.getByRole('link', { name: 'More info' }).click();
  const store_address = await page.getByRole('button', { name: 'Copy' }).innerText();
  await page.getByTestId('close-button').click();
  console.log(store_address);


  const regex = /\d\.\d\s\(\d+[\+]*\s?ratings?\)\s\W\s[A-Za-z]+(?:\s?[A-Za-z]+)*\s/;
  var match = null;

  try {
    const text = await page.getByText(/\d\.\d\s\(\d+[\+]*\s?ratings?\)\s\W\s[A-Za-z]+(?:\s?[A-Za-z]+)*\s/).innerText();
    match = text.match(regex);
  } catch (error) {
    console.log('No match found.');
  }

  var rating = "";

  if (match) {
    const rating = match[1];
    const numOfRatings = match[2];
    const cuisineType = match[3];
  
    console.log(`Rating: ${rating}`);
    // console.log(`Number of Ratings: ${numOfRatings}`);
    // console.log(`Cuisine Type: ${cuisineType}`);
  } else {
    console.log('No match found.');
  }

  const menu_items = await page.getByRole('listitem').allTextContents();
  console.log(menu_items);

  if (rating) {
    rating = "";
  }

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
    try {
      const jsonData = JSON.parse(fileContent);
      jsonData.push(scrapedData);
      await fs.writeFile(fileName, JSON.stringify(jsonData, null, 2));
    } catch (jsonError: any) {
      console.error('Error parsing JSON data:', jsonError);
      // If the JSON data is malformed, create a new file with the scraped data as the first item
      await fs.writeFile(fileName, JSON.stringify([scrapedData], null, 2));
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, create a new file with the scraped data as the first item
      await fs.writeFile(fileName, JSON.stringify([scrapedData], null, 2));
    } else {
      console.error('Error reading or writing the file:', error);
    }
  }  

  // Teardown
  await context.close();
  await browser.close();
}

async function main() {
  // for (const restaurant of restaurantURLs) {
  //   await scrapeRestaurant(restaurant);
  // }
  
  try {
    const data = await readFile('scraped_urls.txt', 'utf-8');
    const restaurants = data.split('\n');

    for (const restaurant of restaurants) {
      await scrapeRestaurant(restaurant);
    }

    console.log('Scraping completed');
  } catch (err) {
    console.error('Error during scraping:', err);
  }
}

main();