// Relay between the Siteworks Price Book page and OpenCode Zen.
// Holds the OpenCode key as a secret (OPENCODE_KEY), only serves the page's own origin,
// only calls the free models listed in MODELS, and forces its own instructions in front of every chat.

const ZEN = 'https://opencode.ai/zen/v1/chat/completions';
const MAX_CONTEXT = 24000;   // characters of price list accepted from the page
const MAX_TURNS = 10;        // chat messages kept per request
const MAX_MSG = 1200;        // characters per chat message
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 20;         // requests per IP per window (best effort, per isolate)

const SYSTEM = `You answer questions for a UK energy broker about siteworks prices: new gas and electricity connections, meter installs, upgrades, removals, re-energisation, disconnections and moves.

Rules:
- Use ONLY the price list below. Never invent or estimate a price that is not in it.
- Give the figure first, then the network and area, then say it is before VAT.
- Say the status of the figure: Current, Older list (probably higher now), Unconfirmed, or No fixed price. Give the "from" date when there is one.
- Do simple sums when asked, for example fixed charge plus metres times the per-metre rate, and show the sum.
- If the list does not cover it, say plainly that no published price was found and who to ask (the network for a quote, or the energy supplier for meter work).
- Commercial connections are quote only. Say so.
- Keep it short: two to five sentences, plain text, no markdown, no tables.
- Reply in the same language and style the person writes in (English or Hinglish).
- Only answer questions about these prices and how siteworks pricing works. Politely decline anything else.

Prices were last checked on 01/10/2026.

PRICE LIST (one per line: fuel | job | who for | network, area | what | price | detail | from | status):
`;

const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_HITS;
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const ok = allowed.includes(origin);
    const headers = {
      'Access-Control-Allow-Origin': ok ? origin : allowed[0] || 'null',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
      'Content-Type': 'application/json',
    };
    const out = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers });

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    // The page asks this first and only shows the ask box when the relay is switched on.
    if (req.method === 'GET') return out({ ready: Boolean(env.OPENCODE_KEY) && env.ENABLED === '1' });
    if (req.method !== 'POST') return out({ error: 'POST only' }, 405);
    if (!ok) return out({ error: 'This relay only serves the price book page.' }, 403);
    if (!env.OPENCODE_KEY) return out({ error: 'Relay has no key set yet.' }, 503);
    if (limited(req.headers.get('CF-Connecting-IP') || 'unknown')) {
      return out({ error: 'Too many questions in a short time. Try again in a few minutes.' }, 429);
    }

    let body;
    try {
      const raw = await req.text();
      if (raw.length > MAX_CONTEXT + MAX_TURNS * MAX_MSG + 2000) return out({ error: 'Request too large.' }, 413);
      body = JSON.parse(raw);
    } catch (e) {
      return out({ error: 'Bad request.' }, 400);
    }
    const context = String(body.context || '').slice(0, MAX_CONTEXT);
    const turns = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_TURNS)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MSG) }));
    if (!context || !turns.length || turns[turns.length - 1].role !== 'user') return out({ error: 'Bad request.' }, 400);

    const messages = [{ role: 'system', content: SYSTEM + context }].concat(turns);
    const models = (env.MODELS || '').split(',').map((s) => s.trim()).filter(Boolean);
    let detail = 'no models configured';
    for (const model of models) {
      try {
        const res = await fetch(ZEN, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + env.OPENCODE_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages, max_tokens: 700, temperature: 0.2 }),
        });
        const data = await res.json().catch(() => null);
        const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (res.ok && reply && String(reply).trim()) return out({ reply: String(reply).trim(), model });
        detail = model + ': ' + res.status + ' ' + ((data && data.error && (data.error.type || data.error.message)) || 'empty reply');
        console.log('zen failure', detail);
      } catch (e) {
        detail = model + ': ' + (e && e.message);
        console.log('zen exception', detail);
      }
    }
    return out({ error: 'The free model is not answering right now. The prices on the page still work.', detail }, 502);
  },
};
