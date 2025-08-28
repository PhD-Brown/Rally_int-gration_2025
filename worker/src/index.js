// Worker "rally-start" : assigne un indice de départ séquentiel (0..TOTAL_STATIONS-1)
// 1ère équipe => 0, 2e => 1, etc. (wrap automatique)

export class StartCounter {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/next") {
      const total = parseInt(url.searchParams.get("count") ?? this.env.TOTAL_STATIONS ?? "20", 10);
      let next = await this.state.storage.get("next");
      if (typeof next !== "number") next = 0;

      const startIndex = ((next % total) + total) % total;
      await this.state.storage.put("next", next + 1);

      return json({ startIndex });
    }

    if (url.pathname === "/reset") {
      // possibilité de reset manuel (optionnel) :
      await this.state.storage.put("next", 0);
      return json({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return cors();
    }

    // Endpoint public appelé par ton app : /claim?count=20
    if (url.pathname === "/claim") {
      const count = url.searchParams.get("count") ?? env.TOTAL_STATIONS ?? "20";
      const id = env.START_COUNTER.idFromName("global");
      const stub = env.START_COUNTER.get(id);
      const res = await stub.fetch(`https://do.internal/next?count=${encodeURIComponent(count)}`);
      const data = await res.json();
      return cors(json(data));
    }

    return new Response("Not found", { status: 404 });
  }
};

// Helpers CORS / JSON
function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: { "content-type": "application/json" },
  });
}

function cors(resp = new Response(null, { status: 204 })) {
  const h = resp.headers;
  h.set("access-control-allow-origin", ALLOWED());
  h.set("access-control-allow-methods", "GET,POST,OPTIONS");
  h.set("access-control-allow-headers", "content-type, authorization");
  h.set("access-control-max-age", "86400");
  return resp;
}

function ALLOWED() {
  // Si tu veux verrouiller : remplace "*" par l’URL de ton site (ex: "https://phd-brown.github.io")
  return typeof ALLOWED_ORIGIN !== "undefined" ? ALLOWED_ORIGIN : "*";
}
