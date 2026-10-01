# Siteworks Price Book

Published UK gas and electricity siteworks prices, with clickable context and source URLs for every figure, plus broker fee research and London planning examples.

Live page: https://suman1-cpu.github.io/siteworks-price-book/

Apple-inspired interface with system, light and dark appearances. The free Zen ask box uses matched price rows and replies in English only. Optional online search is limited to UK siteworks and energy broker fees and shows source links. Search snippets are leads to verify. Missing broker tariffs are not treated as zero; London examples show underlying work components and exclude unknown broker fees.

Last checked 01/10/2026. Refresh manually when asked. No scheduled jobs. VAT basis is shown per source.

The question library offers 73 examples from a 76-scenario broker inventory covering supply capacity, metering, connections, isolation, moves, fees and quote calculations, operations and conversation boundaries. Three privacy/abuse scenarios remain test cases only. See `tools/question-coverage.json` and `tools/ask-audit.md`. Matching keeps job comparisons, sizes and follow-up context while rejecting incompatible locations, pressure and supply scopes. London single-to-three-phase conversion uses a checked contractor planning guide, not an observed TPI fee minimum/maximum. Live search failure retains qualified reference sources and an honest status. If the free model fails, the UI shows relevant matched source records with an explicit AI-unavailable notice.

## Build and check

Run from the project folder:

```sh
./build.sh
node tools/bench.mjs rows
node --test tools/context.test.mjs relay/worker.test.mjs
```

Edit `price_book.html`; `index.html` is built from it. Broker research and assumptions are recorded in `tools/tpi-research.json` and embedded in the page. Keep them in sync when refreshing.

For a local preview, use a static HTTP server. Chat POST requests work on the published GitHub Pages origin only; preview chat should use mocked responses. Check desktop and 400px layouts, both themes, source dialogs, filtering and chat when changing UI.

## Relay deployment

Deploy only with the explicit relay configuration:

```sh
cd relay
npx wrangler deploy --config wrangler.toml
```

See `relay/README.md` for the search contract and bounds. Keep keys in Worker secrets. No paid model fallback is allowed.
