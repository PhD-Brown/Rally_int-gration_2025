// functions/api/admin/reset.js
export const onRequestPost = async ({ request, env }) => {
  const url = new URL(request.url);
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '') || url.searchParams.get('token') || '';
  if (env.ADMIN_TOKEN && token !== env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { scope = 'teams', confirm } = await request.json().catch(() => ({}));
  if (confirm !== 'RESET') {
    return new Response(JSON.stringify({ ok: false, error: 'CONFIRM_REQUIRED' }), {
      headers: { 'content-type': 'application/json' },
      status: 400,
    });
  }

  const out = { ok: true, scope };

  // 1) Purge KV (classement)
  if (scope === 'teams' || scope === 'all') {
    const idxRaw = await env.RALLYE_KV.get('teams:index');
    const ids = idxRaw ? JSON.parse(idxRaw) : [];
    await Promise.all(ids.map(id => env.RALLYE_KV.delete(`team:${id}`)));
    await env.RALLYE_KV.put('teams:index', JSON.stringify([]));
    out.teamsCleared = ids.length;
  }

  // 2) Purge R2 (photos)
  if (scope === 'photos' || scope === 'all') {
    let cursor, deleted = 0;
    do {
      const list = await env.R2_BUCKET.list({ cursor, limit: 1000 });
      cursor = list.cursor;
      const keys = (list.objects || []).map(o => o.key);
      if (keys.length) { await env.R2_BUCKET.delete(keys); deleted += keys.length; }
      if (!list.truncated) break;
    } while (true);
    out.photosDeleted = deleted;
  }

  return new Response(JSON.stringify(out), { headers: { 'content-type': 'application/json' } });
};
