export const onRequestPost = async ({ request, env }) => {
  const form = await request.formData();
  const file = form.get('file');
  const teamId = (form.get('teamId') || 'anon').toString();
  const stationId = (form.get('stationId') || 'unknown').toString();

  if (!(file instanceof File)) {
    return new Response('No file', { status: 400 });
  }

  const now = new Date().toISOString().replace(/[:.]/g, '');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `${teamId}/${stationId}/${now}-${safeName}`;

  await env.R2_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  });

  // URL de lecture via l’API ci-dessous
  return new Response(JSON.stringify({ ok: true, key, url: `/api/file/${encodeURIComponent(key)}` }), {
    headers: { 'content-type': 'application/json' },
  });
};
