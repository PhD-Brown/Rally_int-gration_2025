export const onRequestGet = async ({ params, env }) => {
  const raw = Array.isArray(params.key) ? params.key.join('/') : params.key;
  const key = decodeURIComponent(raw);          // ← important

  const obj = await env.R2_BUCKET.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('Cache-Control', 'public, max-age=3600');
  return new Response(obj.body, { headers });
};
