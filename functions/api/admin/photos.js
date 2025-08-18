// functions/api/admin/photos.js
export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);

  // Auth simple par Bearer token
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '') || url.searchParams.get('token') || '';
  if (env.ADMIN_TOKEN && token !== env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  const teamId = url.searchParams.get('teamId') || ''; // optionnel
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '1000', 10), 1000);
  const cursor = url.searchParams.get('cursor') || undefined;

  const list = await env.R2_BUCKET.list({
    prefix: teamId ? `${teamId}/` : undefined,
    limit,
    cursor,
  });

  const items = (list.objects || []).map((o) => {
    const parts = o.key.split('/');
    return {
      key: o.key,
      teamId: parts[0] || null,
      stationId: parts[1] || null,
      filename: parts.slice(2).join('/') || null,
      size: o.size,
      uploadedAt: (o.uploaded && typeof o.uploaded.toISOString === 'function')
        ? o.uploaded.toISOString()
        : (o.uploaded || null),
      // URL publique via notre route de lecture
      url: `/api/file/${encodeURIComponent(o.key)}`,
    };
  });

  return new Response(JSON.stringify({
    items,
    truncated: !!list.truncated,
    cursor: list.cursor || null,
  }), { headers: { 'content-type': 'application/json' } });
};
