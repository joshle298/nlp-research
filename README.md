# nlp-research

## Final Paper
[NLP-Paper.pdf](https://github.com/joshle298/nlp-research/files/11473171/Group1_NLP_Final.pdf)

## Scripts
Run both scripts with `npm run dev` in the `uber-eats-scraper` directory.

To run the script that gets URLs

FIRST MAKE SURE YOU CLEAR THE EXISTING CONTENTS OF `scraped_urls.txt`
Change the URL that you're scraping on to use a URL on uber eats that is searching in the correct location.
Then run:

```
npm run url
```


Edit the index.ts file line:

```
const fileName = "scraped_data_<NAME>.json";
```

As well as the package.json file lines

```
    "dev": "concurrently \"npx tsc --watch\" \"nodemon -q dist/index.js --ignore ./scraped_data_<NAME>.json\"",
    "url": "concurrently \"npx tsc --watch\" \"nodemon -q dist/urlScraper.js --ignore ./scraped_data_<NAME>.json\""
```

Then once the URLs are loaded into `scraped_urls.txt`, run:

```
npm run dev
```
