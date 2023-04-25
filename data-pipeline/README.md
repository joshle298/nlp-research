# Data Pipeline

Run the `mergeData.py` file with `python mergeData.py` or with `python3 mergeData.py` command.

### What it does
It runs through the following file paths of scraped UberEats restaurants and concatenates the
restaurants into a new JSON file called merged-data.json.

```
"scrapers/uber-eats-scraper/scraped_data_mimi.json"
"scrapers/uber-eats-scraper/scraped_data_josh.json"
"scrapers/uber-eats-scraper/scraped_data_akhil.json"
```

In doing so, the pipeline will remove all duplicate restaurants, which can occur when scraping restauraunts near 2 different locations in the same city/neighborhood. 