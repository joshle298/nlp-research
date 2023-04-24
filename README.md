# nlp-research

Run both scripts with `npm run dev` in the `uber-eats-scraper` directory.

To run the script that gets URLs

FIRST MAKE SURE YOU CLEAR THE EXISTING CONTENTS OF `scraped_urls.txt`
Change the URL that you're scraping on to use a URL on uber eats that is searching in the correct location.
Then change `scrapers/uber-eats-scraper.package.json` to: 
```
{
  "name": "uber-eats-scraper",
  "version": "1.0.0",
  "description": "",
  "main": "urlScraper.js",
  "scripts": {
    "build": "npx tsc",
    "start": "node dist/urlScraper.js",
    "dev": "concurrently \"npx tsc --watch\" \"nodemon -q dist/urlScraper.js --ignore ./scraped_data.json\""
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/node": "^18.15.12",
    "concurrently": "^8.0.1",
    "nodemon": "^2.0.22",
    "playwright": "^1.32.3",
    "typescript": "^5.0.4"
  }
}
```

Then once the URLs are loaded into `scraped_urls.txt`, change the `package.json` to:

```
{
  "name": "uber-eats-scraper",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "npx tsc",
    "start": "node dist/index.js",
    "dev": "concurrently \"npx tsc --watch\" \"nodemon -q dist/index.js --ignore ./scraped_data.json\""
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/node": "^18.15.12",
    "concurrently": "^8.0.1",
    "nodemon": "^2.0.22",
    "playwright": "^1.32.3",
    "typescript": "^5.0.4"
  }
}
```