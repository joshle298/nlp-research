import { chromium } from "playwright";
import fs from "fs/promises";
import { readFile } from "fs/promises";

async function scrapeRestaurant(url: string) {
  // Setup
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(url);
  console.log("Page loaded");

  // await page.pause();

  try {
    await page.getByTestId("close-button").click();
  } catch (error) {
    console.log("Close button not found or not needed");
  }

  try {
    await page
      .getByRole("button", { name: "Opt out" })
      .click({ timeout: 10_000 });
  } catch (error) {
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

  // const regex =
  //   /\d\.\d\s\(\d+[\+]*\s?ratings?\)\s\W\s[A-Za-z]+?(?:\s?[A-Za-z]+)*\s/;
  // var match = null;

  // try {
  //   const text = await page
  //     .getByText(
  //       /\d\.\d\s\(\d+[\+]*\s?ratings?\)\s\W\s[A-Za-z]+?(?:\s?[A-Za-z]+)*\s/
  //     )
  //     .innerText();
  //   match = text.match(regex);
  // } catch (error) {
  //   console.log("No match found.");
  // }

  // var rating = "";

  // if (match) {
  //   const rating = match[1];
  //   const numOfRatings = match[2];
  //   const cuisineType = match[3];

  //   console.log(`Rating: ${rating}`);
  //   // console.log(`Number of Ratings: ${numOfRatings}`);
  //   // console.log(`Cuisine Type: ${cuisineType}`);
  // } else {
  //   console.log("No match found.");
  // }

  const menu_items = await page.getByRole("listitem").allTextContents();
  // console.log(menu_items);

  // if (rating) {
  //   rating = "";
  // }

  // Save scraped data to a JSON file
  var scrapedData = {
    store_name,
    store_address,
    // rating,
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

  scrapedData.menu_items = scrapedData.menu_items.map((item: string) => item.replace(/Quick view/g, ''));
  scrapedData.menu_items = scrapedData.menu_items.filter((item: string) => !forbidden.includes(item));

  const fileName = "scraped_data_josh.json";

  try {
    const fileContent = await fs.readFile(fileName, "utf-8");
    try {
      const jsonData = JSON.parse(fileContent);
      jsonData.push(scrapedData);
      await fs.writeFile(fileName, JSON.stringify(jsonData, null, 2));
    } catch (jsonError: any) {
      console.error("Error parsing JSON data:", jsonError);
      // If the JSON data is malformed, create a new file with the scraped data as the first item
      await fs.writeFile(fileName, JSON.stringify([scrapedData], null, 2));
    }
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // If the file doesn't exist, create a new file with the scraped data as the first item
      await fs.writeFile(fileName, JSON.stringify([scrapedData], null, 2));
    } else {
      console.error("Error reading or writing the file:", error);
    }
  }

  // Teardown
  await context.close();
  await browser.close();
}

async function main() {

  try {
    const data = await readFile("scraped_urls.txt", "utf-8");
    const restaurantURLs = data.split("\n");

    for (const restaurant of restaurantURLs) {
      await scrapeRestaurant(restaurant);
    }

    console.log("Scraping completed");
  } catch (err) {
    console.error("Error during scraping:", err);
  }
}

main();
