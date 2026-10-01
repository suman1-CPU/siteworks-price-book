# Ask the price book relay

The Worker keeps the Zen key server-side and accepts the configured page origin
only. The model allowlist is `space-bunny-free`; an environment change cannot
select a paid model. The existing best-effort limit remains 20 requests per IP
per 10 minutes. `ENABLED=0` disables chat requests as well as page readiness.

POST accepts the existing `context` and `messages` fields. Web search is opt-in
only, with `search: true`. The server extracts recognised siteworks, fuel, meter
size, location and energy broker names into a fixed domain query. It ignores
caller-provided `query` and `url` fields. Off-topic questions, mixed-topic requests,
common prompt overrides and user URLs are blocked before outgoing search. A
new broker not recognised by name can still be requested as an energy broker;
the search remains a general UK energy broker fee search.

Search uses one request to Brave's public HTML search page, without an account,
key or paid API. It has a 7-second timeout, a 512-KiB response limit, and returns
at most five relevant results, each with a 180-character title and 500-character
snippet. It never fetches arbitrary user URLs or search result pages. Public
HTML search is a best-effort integration, not a guaranteed API: rate limits,
challenges or markup changes can make it unavailable. Such failures return an
honest status and fall back to the supplied price context, with no silent paid
fallback or challenge bypass.

Responses retain `reply` and `model`, and add:

```json
{
  "sources": [{"title": "Source title", "url": "https://example.org/source", "snippet": "Search evidence"}],
  "search": {"requested": true, "status": "ok", "query": "server-built query", "message": "Search snippets are leads. Open the sources to verify prices and dates."}
}
```

Search status is `not_requested`, `ok`, `unavailable`, or `blocked`. A blocked
request returns a scope explanation without a model call. Sources are search
discovery leads, not proof that a full source page or a current tariff was
verified. Model instructions require numbered citations, preserve price-list
status and VAT qualifications, separate siteworks costs from broker fees and
per-kWh procurement commission, and forbid fabricated exact provider fees.
London planning estimates may only be repeated when supplied with an explicit
estimate label, assumptions and basis in the page context.

Zen requests have a 25-second timeout and a 64-KiB response limit. Local lookup
keeps its 700-token budget; search answers allow 2,000 tokens for reasoning but
still request a short answer. The free model can occasionally return HTTP 200
with empty content; that is reported as unavailable while preserving any search
sources for the page to show. Outbound redirects use `manual` and are rejected;
Cloudflare's runtime does not implement the standard Fetch `error` mode.

Run local verification with `node --test relay/worker.test.mjs` from the project
root. Tests mock outbound search and Zen requests and do not use any credentials
or consume live relay rate-limit allowance. Search availability must also be
checked after deployment because provider treatment of Cloudflare IPs can
differ from local requests.
