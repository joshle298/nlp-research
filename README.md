# nlp-research

Run both scripts with `npm run dev` in the `uber-eats-scraper` directory.

To run the script that gets URLs

FIRST MAKE SURE YOU CLEAR THE EXISTING CONTENTS OF `scraped_urls.txt`
Change the URL that you're scraping on to use a URL on uber eats that is searching in the correct location.
Then run:

```
npm run url
```

Edit the index.ts file line 

```
const fileName = "scraped_data_<NAME>.json";
```

Then once the URLs are loaded into `scraped_urls.txt`, run:

```
npm run dev
```