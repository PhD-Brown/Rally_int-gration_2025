// --- CORS util ---
const cors = {
  headers(origin = "*") {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Content-Type": "application/json; charset=utf-8",
    };
  },
  preflight() {
    return new Response(null, { headers: this.headers() });
  },
};

// ---- Durable Object : StartAllocator ----
export class StartAllocator {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const headers = cors.headers();

    if (request.method === "OPTIONS") return cors.preflight();

    if (url.pathname === "/allocate" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const teamKey = (body && body.teamKey) || "";
      if (!teamKey) {
        return new Response(JSON.stringify({ error: "teamKey manquant" }), { status: 400, headers });
      }

      let data = (await this.state.storage.get("data")) || { next: 0, assignments: {} };

      // idempotent : même équipe -> même index
      if (data.assignments[teamKey] !== undefined) {
        return new Response(JSON.stringify({ index: data.assignments[teamKey] }), { headers });
      }

      const list = (this.env.START_INDICES || "1,6,15")
        .split(",")
        .map((x) => parseInt(x.trim(), 10))
        .filter((n) => Number.isFinite(n) && n >= 0);

      if (list.length === 0) {
        return new Response(JSON.stringify({ error: "START_INDICES vide" }), { status: 500, headers });
      }

      const index = list[data.next % list.length];
      data.assignments[teamKey] = index;
      data.next = (data.next + 1) % 1000000000;

      await this.state.storage.put("data", data);
      return new Response(JSON.stringify({ index }), { headers });
    }

    if (url.pathname === "/reset" && request.method === "POST") {
      const auth = request.headers.get("Authorization") || "";
      if (auth !== `Bearer ${this.env.ADMIN_TOKEN}`) {
        return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers });
      }
      await this.state.storage.delete("data");
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers });
  }
}

// ---- Worker façade HTTP ----
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = cors.headers();

    if (request.method === "OPTIONS") return cors.preflight();

    // POST /nextStart -> alloue un index de départ
    if (url.pathname === "/nextStart" && request.method === "POST") {
      const id = env.START_ALLOCATOR.idFromName("global");
      const obj = env.START_ALLOCATOR.get(id);
      const resp = await obj.fetch("https://do/allocate", request);
      const payload = await resp.text();
      return new Response(payload, { status: resp.status, headers });
    }

    // POST /admin/reset (optionnel)
    if (url.pathname === "/admin/reset" && request.method === "POST") {
      const id = env.START_ALLOCATOR.idFromName("global");
      const obj = env.START_ALLOCATOR.get(id);
      const resp = await obj.fetch("https://do/reset", request);
      const payload = await resp.text();
      return new Response(payload, { status: resp.status, headers });
    }

    return new Response(JSON.stringify({ ok: true, service: "rallye-start" }), { headers });
  },
};
