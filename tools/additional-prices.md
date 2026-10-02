# Additional UK siteworks prices and quote routes

Checked 2 October 2026. `additional-prices.json` contains 21 additional records: 17 numeric references and four quote routes. Eleven numeric records are current published source evidence (three averages and eight transactional tariffs); six are explicitly older Yü 2025 tariffs. Quote routes contain no numeric amount. All entries retain source links, VAT qualifications, customer and geographical scope.

## London network context

[UKPN emergency costs](https://www.ukpowernetworks.co.uk/i-already-have-electricity-domestic/disconnect/emergency-disconnections-costs) publishes London underground averages of £3,418 for emergency disconnection and £4,643 for emergency reconnection, plus an average £2,079 traffic-management component when required. These exclude VAT and can rise with additional works. Price text explicitly says **average**. These must not be offered as planned-job tariffs or maximum prices.

[Small temporary supplies](https://www.ukpowernetworks.co.uk/new-electricity-connections/connect-1-4-properties-domestic-small-business/temporary-electricity-connection-cost-and-time), [large temporary supplies](https://www.ukpowernetworks.co.uk/new-electricity-connections/connect-a-commercial-project/temporary-connection-cost-time-and-whats-involved) and [supply-point moves](https://www.ukpowernetworks.co.uk/i-already-have-electricity-domestic/move) have useful cost-indicator or application routes rather than a defensible fixed charge. The small route is up to 69 kVA; the large page says over 70 kVA. Confirm jobs above 69 and up to 70 kVA rather than silently assigning them to either route.

The UKPN emergency page renders £412.50 against EPN de-energisation and re-energisation but blank London/SPN rows in extracted content. I deliberately did not assign it to London. Do not use this as a London isolation figure without inspecting the provider's current table and confirming its geographical scope.

## Current Scottish electricity evidence

[SP Distribution April 2026 statement](https://www.scottishpower.com/documents/d/guest/Miscellaneous_Services_Statement_SPD_April_2026#page=6), Annex A, is now accessible. New records cover out-of-hours whole-current visits, short-notice entry, abortive visits, no-fault/wrong-category service-termination attendance and CT/HV quoted work. The tariff is exclusive of VAT and regional; do not use it as a London or SP Manweb tariff. Its short-notice row describes a surcharge, so confirm the addition basis before summing it with a standard charge.

The original unconfirmed £46.74 normal-hours row should be updated to verified £71. The new OOH record contains `updateOriginal` with the exact original item string and replacement source information. A fee charged whether attendance succeeds should not be double-counted with a second abortive fee for the same attendance.

## Supplier evidence and older-price status

The [Yü 2025 metering schedule](https://www.yuenergy.co.uk/app/uploads/2025/07/Metering-Charges-25-July.pdf) is now accessible. It states it was last reviewed March 2025, so new records remain **old**. No current 2026 list was verified. Added references are HH COP10, COP5 and COP3 installation, electricity re/de-energisation and an aborted appointment. These are supplier charges; DNO cable works remain separate.

The first HH record contains `updateOriginal` for three already-listed Yü items. These are evidence corrections, not three extra prices:

| Original exact item | Verified net | Printed gross | Source page |
| --- | ---: | ---: | --- |
| U16 meter install, exchange or removal | £460.83 | £553 | 3 |
| Advanced meter install or exchange | £424.17 | £509 | 2 |
| Electricity meter removal | £220 | £264 | 2 |

The PDF explicitly states 20% VAT for these rows. Removal may include contract-breaker and MAP early-removal costs beyond the printed removal fee. Preserve that context when quoting. The existing claim that the list has been taken off the website is now stale and should be replaced with the verified older-source description.

## Current gas additions

[SGN Southern June 2026 schedule](https://www.sgn.co.uk/sites/default/files/media-entities/documents/2026-02/2.%20Southern%202026.pdf#page=4) adds domestic-size security-collar fitting and prepayment decommission/recommission components. The transactional table's VAT basis is not explicitly labelled. These are meter-owner charges to the supplier; do not imply the same customer total. These two records are home-only, not commercial meter-price additions.

## Integration notes

- `amountType` distinguishes averages, published tariffs, quote routes and the ambiguous short-notice addition basis.
- All jobs map to the existing eight `JOBS` labels. A detailed item and scope still matter: the broad category alone does not establish the price for an arbitrary isolation or installation.
- `updateOriginal` records are nested metadata for safe exact-item evidence corrections. They must not be appended as extra price cards.
- No artificial London premium, broker fee, engineering capacity approval or TPI market minimum/maximum was created.
- JSON source URLs use PDF page fragments where possible. All sources are primary network, supplier or meter-owner publications.

Root verification added a separate Yü SMETS2 zero metering-charge record from the same primary 2025 PDF, page 2. It is older, eligibility-dependent supplier metering only; network and broker work remain separate. Final expansion: 21 records (17 numeric references including this published zero, four quote routes), plus four existing-record evidence corrections.
