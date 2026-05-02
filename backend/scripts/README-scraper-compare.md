# Scrapling Comparison

This compares legacy `python/fetch_page.py` output with the central Scrapling service `geo-page` profile.

## Requirements

- Scraper service is running.
- GeoSerra backend env has:

```bash
SCRAPER_ENABLED=true
SCRAPER_URL=http://127.0.0.1:8200
SCRAPER_API_KEY=scraper-geoserra-change-me
```

## Run

```bash
bun run scraper:compare
```

Custom URL list:

```bash
bun run scripts/compare-scrapers.ts --urls=scripts/scraper-test-urls.txt --output=diff-report.json
```

## Review Criteria

- `critical_diff_count` must be `0` before enabling production.
- Tolerated differences: `headers`, `text_content` whitespace, `redirect_chain`, minor `word_count` drift within roughly 5%.
