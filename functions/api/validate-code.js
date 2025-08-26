import STATIONS from 'src/lib/App.jsx'

// Simple table côté serveur (tu peux la déplacer plus tard en KV/D1)
const CODE_MAP = STATIONS.reduce((map, station) => {
  map[station.id] = station.code;
  return map;
}, {});

console.log("STATIONS:", STATIONS);
console.log("CODE_MAP:", CODE_MAP);

export const onRequestPost = async ({ request }) => {
  try {
    const { stationId, code } = await request.json();
    const expected = CODE_MAP[stationId];
    const ok = expected && expected.trim().toUpperCase() === (code || '').trim().toUpperCase();
    return new Response(JSON.stringify({ ok }), {
      headers: { 'content-type': 'application/json' },
      status: ok ? 200 : 400,
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'BAD_REQUEST' }), {
      headers: { 'content-type': 'application/json' },
      status: 400,
    });
  }
};
