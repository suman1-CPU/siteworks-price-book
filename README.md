# Siteworks Price Book

Published UK gas and electricity siteworks prices, with clickable context and source URLs for every figure, plus broker fee research and London planning examples.

Live page: https://suman1-cpu.github.io/siteworks-price-book/

Apple-inspired broker workspace with system, light and dark appearances. Task tabs separate price lookup, draft estimates, London budgets, broker fees and Ask & learn. Source cards lead with provider and applicability; details reveal conditions and URLs. Compare up to four records by scope before choosing a component. The free Zen ask box uses matched price rows and replies in English only. Optional online search is limited to UK siteworks and energy broker fees and shows source links. Search snippets are leads to verify. Missing broker tariffs are not treated as zero; London examples show underlying work components and exclude unknown broker fees.

Baseline checked 01/10/2026; expanded sources and terminology checked 02/10/2026. Older published lists retain their original dates. There are 80 price records (including quote routes), eight London planning references and eight researched brokers. Refresh manually when asked. No scheduled jobs. VAT basis is shown per source.

The question library offers 73 examples from a 76-scenario broker inventory covering supply capacity, metering, connections, isolation, moves, fees and quote calculations, operations and conversation boundaries. Three privacy/abuse scenarios remain test cases only. See `tools/question-coverage.json` and `tools/ask-audit.md`. Matching keeps job comparisons, sizes and follow-up context while rejecting incompatible locations, pressure and supply scopes. London single-to-three-phase conversion uses a checked contractor planning guide, not an observed TPI fee minimum/maximum. Live search failure retains qualified reference sources and an honest status. If the free model fails, the UI shows relevant matched source records with an explicit AI-unavailable notice.

The estimate builder itemises network, meter-owner, supplier and broker components with quantities, optional markup or target margin, and explicitly entered VAT assumptions. Ranges and averages do not prefill as fixed costs. Blank costs and unknown VAT leave the inclusive total incomplete. Copy or download a draft with source URLs, effective and checked dates, original source VAT wording, edited allowances and applicability/overlap warnings. Drafts stay in memory for the current session.

The dictionary contains 60 sourced terms and seven job preparation checklists. Definitions and relevant checks can also enter the assistant context.

## Build and check

Run from the project folder:

```sh
./build.sh
node tools/bench.mjs rows
node --test tools/context.test.mjs tools/quote-core.test.mjs relay/worker.test.mjs
```

Edit `price_book.html` and `assets/siteworks.css`; `index.html` is built from the fragment. `assets/workspace.js` controls the broker tools; `assets/quote-core.js` contains calculation/export logic. Expanded price metadata in `tools/additional-prices.json` is embedded in the fragment as `ADDITIONAL_PRICES`; keep both in sync. `tools/siteworks-glossary.json` generates `assets/resources.js` as `window.SITEWORKS_RESOURCES=<JSON>;`; regenerate that asset whenever glossary data changes. Broker research and assumptions are recorded in `tools/tpi-research.json` and embedded in the page. Keep them in sync when refreshing.

For a local preview, use a static HTTP server. Chat POST requests work on the published GitHub Pages origin only; preview chat should use mocked responses. Check desktop and 320px/400px layouts in both themes, source dialogs, filtering, estimate variants and export, dictionary, comparisons and chat when changing UI.

## Relay deployment

Deploy only with the explicit relay configuration:

```sh
cd relay
npx wrangler deploy --config wrangler.toml
```

See `relay/README.md` for the search contract and bounds. Keep keys in Worker secrets. No paid model fallback is allowed.
