// POST: { teamId, stationId, seconds }
// GET : renvoie un leaderboard simple

export const onRequestPost = async ({ request, env }) => {
  try {
    const { teamId, stationId, seconds } = await request.json();
    if (!teamId || !stationId) return new Response('BAD_REQUEST', { status: 400 });

    const key = `team:${teamId}`;
    const raw = await env.RALLYE_KV.get(key);
    const now = Date.now();

    let rec = raw ? JSON.parse(raw) : { teamId, stations: [], last: now, started: now };
    if (!rec.stations.includes(stationId)) rec.stations.push(stationId);
    rec.last = now;
    rec.seconds = typeof seconds === 'number' ? seconds : rec.seconds;

    await env.RALLYE_KV.put(key, JSON.stringify(rec));
    return new Response(JSON.stringify({ ok: true, done: rec.stations.length }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response('ERROR', { status: 500 });
  }
};

export const onRequestGet = async ({ env }) => {
  // petit scan (KV n’a pas de “list by prefix” global côté Pages; on stocke un index léger)
  const idxRaw = await env.RALLYE_KV.get('teams:index');
  const ids = idxRaw ? JSON.parse(idxRaw) : [];
  const recs = [];

  for (const id of ids) {
    const raw = await env.RALLYE_KV.get(`team:${id}`);
    if (raw) recs.push(JSON.parse(raw));
  }

  recs.sort((a, b) => (b.stations.length - a.stations.length) || ((a.last||0) - (b.last||0)));
  return new Response(JSON.stringify(recs.slice(0, 50)), { headers: { 'content-type': 'application/json' } });
};
