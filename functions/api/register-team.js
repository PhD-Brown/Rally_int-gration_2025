export const onRequestPost = async ({ request, env }) => {
  const { teamId } = await request.json();
  if (!teamId) return new Response('BAD_REQUEST', { status: 400 });

  const raw = await env.RALLYE_KV.get('teams:index');
  const ids = raw ? JSON.parse(raw) : [];
  if (!ids.includes(teamId)) {
    ids.push(teamId);
    await env.RALLYE_KV.put('teams:index', JSON.stringify(ids));
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};
