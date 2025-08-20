export const onRequestGet = async ({ env }) => {
  // Retourne le classement (inchangé)
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
  return new Response(JSON.stringify(recs), { headers: { 'content-type': 'application/json' } });
};

export const onRequestPost = async ({ request, env }) => {
  const body = await request.json();
  const teamId = body.teamId?.toString().trim();
  const stationId = body.stationId?.toString().trim();
  const seconds = Number.isFinite(body.seconds) ? body.seconds : null;
  if (!teamId || !stationId) {
    return new Response('Bad Request', { status: 400 });
  }

  const now = Date.now();
  const key = `team:${teamId}`;
  const raw = await env.RALLYE_KV.get(key);
  const rec = raw ? JSON.parse(raw) : { teamId, stations: [], seconds: 0, started: now, last: now };

  // Nettoyage des champs libres
  const cleanNotes =
    typeof body.notes === 'string' ? body.notes.slice(0, 2000) : null;
  const cleanMeas =
    body.measurement == null
      ? null
      : (typeof body.measurement === 'string'
          ? body.measurement
          : String(body.measurement)
        ).slice(0, 120);

  rec.last = now;
  if (seconds != null) rec.seconds = seconds;

  // upsert de la station
  const idx = rec.stations.findIndex(s => s.id === stationId);
  const data = {
    id: stationId,
    seconds: seconds ?? rec.stations[idx]?.seconds ?? 0,
    measurement: cleanMeas,
    notes: cleanNotes,
    at: now,
  };
  if (idx === -1) rec.stations.push(data);
  else rec.stations[idx] = { ...rec.stations[idx], ...data };

  // maintenir l’index des équipes
  const iKey = 'teams:index';
  const iRaw = await env.RALLYE_KV.get(iKey);
  const list = iRaw ? JSON.parse(iRaw) : [];
  if (!list.includes(teamId)) {
    list.push(teamId);
    await env.RALLYE_KV.put(iKey, JSON.stringify(list));
  }

  await env.RALLYE_KV.put(key, JSON.stringify(rec));
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};