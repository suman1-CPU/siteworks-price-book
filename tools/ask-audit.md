> Historical audit of the pre-fix assistant. The highlighted routing and search defects were addressed in the 1 October 2026 update; `tools/context.test.mjs` and `relay/worker.test.mjs` contain the regression checks. The 76-scenario inventory is representative coverage, not a guarantee of every possible model answer.

# TPI ask-box audit

Audit date: 1 October 2026. Independent code review and local selection probes only; no live search or Zen calls. Files inspected: `price_book.html`, `relay/worker.js`, existing relay tests and `tools/bench.mjs`. Review covers the current three-phase-guide changes as they existed during the audit. Recommendations must preserve the original source data.

## Priority fixes

### P1 — Preserve the requested job, provider, fuel and location

- `pick()` currently drops area, then job, then falls back to every row. Empty exact matches must instead produce an explicit no-match context; the model may offer a clearly labelled comparable guide without assigning it to the requested provider. Example: “U25 meter removal Newcastle?” selects SGN Southern England today. EDF is ignored in “Gas meter removal U25 EDF London”, which also selects SGN. Recognise requested providers separately from regions; a missing provider tariff is not permission to use another company's retail fee.
- Detect all requested jobs and meter sizes, not just the first. “U40 install vs removal?” currently sends removal only. Multi-job questions need the union of exact job matches and an explicit no-match for any missing component. Multi-site estimates must keep each job's region, provider and units together.
- `phaseUpgrade()` recognises any mention of three-phase, including removal, relocation and new connections. Restrict its guide injection to an actual existing-supply upgrade intent, or a clearly established upgrade follow-up. Do not use the £3,000–£8,000 upgrade guide for a new commercial three-phase connection, meter exchange or removal.
- Persist a structured topic state across consecutive follow-ups: provider, region, fuel, jobs, sizes, works scope and quote purpose. Current state uses only the immediately preceding user message, so `SGN U16 installation with housing` → `and U25?` → `and without housing?` loses installation and SGN. It then includes an unrelated Yü U16 installation/exchange/removal record. Reset the relevant state when the user explicitly switches provider/job/fuel/location.
- Relay search planning uses only the latest sentence. Checked search blocks useful follow-ups like “and U25?”, “include VAT?” and “which is cheaper?”. Pass bounded resolved topic attributes, validate them server-side and retain the latest question's scope rejection. Search must not make shorthand follow-ups less useful than local lookup.

### P1 — Give a useful answer without inventing broker charges

- The failed screenshot needs a direct two-part response: evidenced London works budget first, unknown arrangement fee second. A checked source permits £3,000–£8,000 as an indicative underlying-works guide, with scope and unstated VAT; it does not establish minimum/maximum TPI fees or a market cap. The separately advertised package starts at £4,995 and has different stated scope. Keep those claims separate.
- Relevant estimates should be available for “how much”, “highest/lowest”, “typical”, “what should I quote”, “cheapest”, “fair charge” and “total”, without requiring the literal keyword `estimate` or `budget`. The site's London default should be stated as an assumption. Do not manufacture a broker fee range where the reviewed evidence provides none.
- Match research budgets to fuel, job and scope. Current research filtering uses job only, so an electricity disconnection can receive gas disconnection examples. Named broker queries should retrieve that broker's fee disclosure plus applicable underlying-work examples, with provider and geography qualifications intact.
- Commission arithmetic, markups, margins, quantities and sums need all operands supplied or sourced. Percent markup differs from gross margin. A p/kWh procurement commission needs annual usage and contract duration, not a siteworks figure. Show one short calculation and separate setup fees from contract costs.

### P2 — Treat evidence as part of the answer

- The current amount modal links every selected input record. It is an evidence bundle, not a verified mapping from a specific generated number to its source. For calculations, preserve operand record IDs and the formula. For published amounts, bind the amount to the exact record; for estimates, bind to the exact research guide. Label unmatched generated figures as unsupported instead of attaching all unrelated rows.
- Keep effective tariff date, checked date, geographic scope, component-versus-total scope, exclusions, VAT basis and confidence with every figure. `Current` describes the site's reviewed source status; a checked date alone does not prove a tariff is current. `vatBasis()` defaults to “before VAT” unless a limited exception matches, so newly added records need explicit VAT metadata rather than inference from absence of a special case.
- Display search status for successful, partial and failed attempts. `renderReply()` currently shows status only for unavailable/blocked results; a partial success warning is hidden even though the relay returns it. Numbered sources and kinds should be visible and stable. Search snippets remain leads, not verified current tariffs.
- HTML scraping of a public Brave page can fail from redirects, markup drift, bot challenges or irrelevant results. A search checkbox must communicate the actual failure and still show the relevant checked guide. A server-supported search API could be a future reliability improvement if available; this audit does not call for a new paid service.
- Relay `MAX_CONTEXT=24000` and message `MAX_MSG=1200` silently truncate. Prioritise exact records and matched budgets ahead of general disclosure; detect oversized context and report that parts were omitted. Measured compact broker research is approximately 5,157 characters, so ordinary broker research truncation is not proven. Broad fallback rows plus a source register create the material risk.
- A single free model can time out or become unavailable. Keep source-backed cards and links usable, report the failure plainly, restore the submitted question for retry and preserve conversation topic state. Do not show an inferred answer as a successful model reply.
- Two to five sentences is fine for one tariff, but too short for multiple jobs or comparisons. Allow compact lists when the user asks for several items; prioritise requested figures, qualifications and sources over generic caveats.

## High-risk acceptance questions

| # | User question or sequence | Expected correct behaviour |
|---|---|---|
| 1 | What's the highest and lowest a TPI can charge for a 3 phase upgrade? | Offer evidenced London underlying-work guide as a planning example; explain that no verified broker-fee minimum/maximum or cap is available. Link guide and quote route; VAT basis remains unstated. |
| 2 | What should I budget for a three-phase upgrade in London? | £3,000–£8,000 guide with contractor/date/scope, separate package from £4,995, separate unknown broker fee and no guaranteed upper limit. |
| 3 | What does Bionic charge to arrange a three-phase upgrade? | Use Bionic disclosure only for its charging model; do not turn contract commission or contractor package into Bionic's arrangement fee. |
| 4 | Remove an existing three-phase electricity meter in London. | Meter-removal scope; supplier/meter-owner quote where absent. Do not give the single-to-three-phase supply upgrade range. |
| 5 | New commercial three-phase connection, 200 kVA, London—total price? | New commercial connection requires site-specific network quote; upgrade guide is not an exact match. Explain unknown civil, reinforcement, metering and broker components. |
| 6 | Three-phase meter relocation two metres, no supply upgrade. | Respect explicit exclusion; no upgrade-guide injection. Quote-only where no relocation tariff exists. |
| 7 | U25 gas meter removal in Newcastle? | Do not silently substitute SGN Southern England. State no exact regional record; a labelled Southern comparison may be offered separately. |
| 8 | EDF U25 gas meter removal in London? | EDF retail fee is unknown unless evidenced. SGN meter-owner component may be explained as a separate qualified comparison, never EDF's price. |
| 9 | SGN U40 install vs removal? | Include both matching jobs, explain housing/install variants, source and VAT basis; do not select removal only. |
| 10 | Compare U16, U25 and U40 removals. | Select all three size records and show each price separately, same schedule/geography/date, component qualification. |
| 11 | SGN U16 installation with housing → and U25? → and without housing? | Persist SGN + gas + installation + size; switch housing only on the last turn. Search on must accept the resolved follow-up. |
| 12 | London three-phase upgrade → and Bionic's fee? → what about VAT? | Preserve upgrade topic and broker identity. VAT is confirmed only for evidenced component, no blanket 20% assertion for an unknown-inclusive package. |
| 13 | Disconnect electricity underground in London. | Electricity network band only; do not supply gas disconnection records. Keep historical distribution and quote qualification. |
| 14 | Disconnect a 125mm gas pipe North London and 90mm East Midlands. | Keep pipe-size band and area pairing per site; quote two components and total only if scopes can be summed. No cross-area rates. |
| 15 | Move a gas pipe six metres in the North West; fixed cost plus metres? | Use fixed charge and metre rate from the same row; show formula, VAT basis and relevant exclusions. |
| 16 | Ten new gas connections in West Midlands, five metres each, customer digs—total? | Establish applicability and any per-site assumptions; correct quantity calculation from matching base/metre schedule, no bulk discount invented. |
| 17 | Lowest gas disconnection provider for a North London property? | Identify applicable network/service constraints; do not imply a customer can choose any regional network solely by cheapest listed price. |
| 18 | Cost is £1,000 excluding VAT; add a 20% markup. | £1,200 before VAT, show £1,000 × 1.20; no assumed VAT-inclusive amount. |
| 19 | Cost is £1,000; what selling price gives 20% gross margin? | £1,250 on the same VAT basis, show £1,000 ÷ 0.80; distinguish markup. |
| 20 | Broker commission 0.5p/kWh, 100,000 kWh/year for three years? | £1,500 commission before any unstated VAT, show pence-to-pounds and duration. Procurement commission is not siteworks fee. |
| 21 | Search online for the latest 2026 price and give the source. | State whether live search succeeded; checked evidence dated separately. Do not label a snippet as verified current tariff. Link sources. |
| 22 | This price seems old—does it still apply? | Effective date versus checked date explained; older/unconfirmed status remains visible; latest quote needed if no current evidence. |
| 23 | Search is down. What can you still tell me about London's three-phase upgrade budget? | Return checked guide and clickable sources with explicit search failure; no invented search results. |
| 24 | Who arranges DNO work, meter exchange and internal wiring; what should my quote include? | Stay within UK siteworks remit; distinguish network, supplier/meter operator, electrician and TPI, identify missing project assumptions and quote line items. Do not invent procedure-specific charges or promises. |

## Wider question families to support

Tariff lookup; component versus customer total; single/multiple meter-size comparison; home versus business; network geography; underlying work versus TPI arrangement fee; ongoing commission; London planning guides; alternatives and package scope; numerical quantities/metres/markup/margin; VAT and tax basis; tariff dates and confidence; citations and verification; job responsibility and quote preparation; follow-up changes; unsupported-job handling; online-search failure; model availability and retry. Questions can combine these families, so intent matching must support multiple constraints rather than a single keyword.

## QA suggestions

1. Run deterministic local selection assertions for the job/provider/region/fuel/size matrices, including all no-match cases. These should test retrieval contracts, not model prose.
2. Add relay tests proving follow-up topic resolution cannot broaden an off-topic request, and three-phase removal/new connections do not automatically become upgrade searches.
3. Stub search success, partial success, no usable evidence, challenge page, timeout and model timeout. Verify honest status and useful checked links in each case.
4. Verify amount-link context for a published tariff, guide range, two-job sum, markup and commission. Unsupported output must not gain apparent provenance from unrelated input records.
5. Run a small bounded live smoke set for the failed screenshot, a multi-turn follow-up, a multi-job comparison and a calculator question after local checks. Avoid exhausting the relay's 20 questions / 10 minute limit with an unbounded live benchmark.
