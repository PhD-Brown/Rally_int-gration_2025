// functions/api/admin/leaderboard.js
export const onRequestGet = async ({ request, env }) => {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (env.ADMIN_TOKEN && token !== env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  const idxRaw = await env.RALLYE_KV.get('teams:index');
  const ids = idxRaw ? JSON.parse(idxRaw) : [];
  const recs = [];
  for (const id of ids) {
    const raw = await env.RALLYE_KV.get(`team:${id}`);
    recs.push(raw ? JSON.parse(raw) : { teamId: id, stations: [], seconds: 0, last: 0, started: 0 });
  }

  recs.sort((a, b) =>
    (b.stations.length - a.stations.length) ||
    ((a.seconds || Infinity) - (b.seconds || Infinity)) ||
    ((a.last || Infinity) - (b.last || Infinity))
  );

  // ajoute un rang
  recs.forEach((r, i) => (r.rank = i + 1));
  return new Response(JSON.stringify(recs), { headers: { 'content-type': 'application/json' } });
};
