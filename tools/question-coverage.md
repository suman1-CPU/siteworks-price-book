# TPI question coverage — 1 October 2026

This is a source-grounded question inventory and acceptance specification for the UK Siteworks Price Book. It does not claim to enumerate every possible wording, verify all source pages again, or establish market-wide broker minimum and maximum fees. The JSON contains 76 realistic questions, including follow-ups, corrections, safety and privacy boundaries. All questions are in English.

## Answer contract

1. Determine the work, fuel, customer type, geography, physical supply/meter size, scope and requested evidence standard. Infer gas from U16/U25/U40/U65/U100/U160, electricity from phase/amps/kVA/MPAN/CT/HH, but clarify genuinely conflicting signals.
2. Keep supply upgrade, meter upgrade, meter exchange, installation, removal, permanent network disconnection and temporary isolation separate. Comparisons/packages may have several intents.
3. Select exact matching published components first. When no exact tariff exists, offer a compatible sourced planning guide or clearly labelled regional/UK proxy for London. Explain fees and excluded works. Do not invent a broker fee, London premium, minimum, maximum or legal cap.
4. Give a useful conditional answer first if existing evidence supports it. Ask only details that change applicability or cost. If neither a usable exact tariff nor compatible estimate exists, state that source gap and show the quote route; do not fabricate a numeric estimate to fill it.
5. Every number needs matching provider/job/area/variant, evidence status, check/list date, VAT basis and source link. Unknown VAT remains unknown. Search failure should preserve stored verified references and estimates.
6. In multi-turn conversation, retain relevant earlier user scope; explicit corrections replace it. Do not merge every earlier user question into one permanent state. Clear an inherited gas U-size when fuel becomes electricity.
7. Local/general guidance does not need customer names, complete addresses, MPAN/MPRN or account numbers. Strip private data from external searches. Emergency requests need a current official safety route before ordinary pricing.

## Coverage taxonomy

| Category | Main distinctions |
|---|---|
| Supply capacity | Single/three phase, already-three-phase increases, fuse/service upgrades, amps/kVA, gas sizing, complex reinforcement |
| Metering | Installation/removal/exchange/replacement, gas U-size target, housing, smart/advanced/CT/half-hourly, supplier versus owner |
| Connections | Domestic/commercial, one property versus multiple, private-land distance, customer dig, meter separate, geography and freshness |
| Disconnections and isolation | Meter versus network service, underground/overhead, pipe diameter, road/footpath, pressure, 400A+, clamp/per visit, reinstatement |
| Moves and civils | Meter-only versus pipe/cable, first metre versus per metre, customer dig, Gas Safe refit, public highway and permits |
| Broker fees and quoting | Arrangement fee versus energy commission, margin/markup, overlapping quotes, VAT, legal caps and observed extrema |
| Booking and process | DNO/supplier/MOP/electrician roles, quote documents, cancellation/abort, timing, meter-removal prerequisites, emergencies |
| Conversation and uncertainty | Pronouns, corrections, offline research, bounded online search, unknown opener, privacy, off-topic and untrusted snippets |

## Priority gaps in the initially inspected implementation

This initial inspection used `price_book.html` plus `tools/tpi-research.json` and `tools/three-phase-research.md`. These describe the starting defects and acceptance needs, not an assertion that the final revised implementation still has them. No live relay calls were made.

- **P0: false scope fallbacks.** `pick()` drops geography and then job when no match exists, finally returns the whole dataset. London electricity isolation/move requests can receive Scotland isolation or gas components. Preserve fuel, job, location and customer scope; no-match is a meaningful result.
- **P0: research matched only by job.** `researchFor()` can attach gas meter-removal budgets to an electricity request. Match fuel/customer/area/size and package scope too.
- **P0: screenshot regression.** The three-phase answer should give the existing sourced London contractor planning example before explaining that a broker arrangement fee and market-wide extrema remain unknown. Numeric planning endpoints are not the lowest/highest charges every TPI can make.
- **P1: fuel and work vocabulary.** U-size implies gas; phases/amps/kVA/CT/HH imply electricity. Distinguish supply upgrade from meter upgrade. `connect` also matches reconnect; change/replace/de-energise lack reliable mapping.
- **P1: scope and variants.** Select meter housing, overhead/underground, pipe diameter, road/footpath, low/intermediate pressure, domestic/commercial, and first-metre/per-metre formulas explicitly. A single first-match job cannot answer install versus removal or network-plus-meter packages.
- **P1: context state.** Fuel corrections must remove incompatible sizes; area corrections override previous area. Follow-up estimate/location does not need all unrelated earlier subjects.
- **P1: estimate access.** Existing matching research should be used when users ask simple cost questions, not only when they say TPI or estimate plus London.
- **P1: uncertainty.** Source not published, outdated, unconfirmed, quote-only, search unavailable and no search requested are different states. Provide useful stored evidence with correct status.
- **P2: fee maths and process.** Proposed commercial fees are user calculations, not observed competitor rates. Do not double-count overlapping packages. Role/timing/document questions deserve structured process answers.

## Evidence limits

The current book has strong gas-network domestic and SGN Southern meter-owner components. Electricity has UKPN disconnection distributions and quote routes, a lower-confidence basic meter-installation guide, and a London contractor three-phase guide. It has no confirmed universal electricity removal/isolation/move/CT/HH tariff, generic commercial connection tariff, or all-broker arrangement-fee schedule. Scenario instructions say when the agent should ask for an exact quote instead of inventing a number. They also say when it should provide an existing relevant estimate despite search failure.

Older Scotland and Wales & West prices are not current London estimates. The SGN Southern owner tariff is conditional on the meter owner, not a guaranteed retail price at every South London address. UKPN cost distributions are historical regional bands, not fixed quotations or extrema. Contractor guide packages are examples with scope, not broker fees.

## Suggested acceptance priority

Start with `upgrade-01`, `upgrade-02`, `meter-01`, `meter-05`, `isolate-08`, `connect-03`, `isolate-04`, `turn-04`, `turn-05` and `fee-09`. Then run exact-component arithmetic, variants, multi-intent comparisons and process guidance. Validate routing locally before spending the rate-limited free model budget. Do not encode unsupported numeric expectations for cases marked no confirmed tariff.
