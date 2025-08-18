export const onRequestGet = async ({ params, env }) => {
  const key = Array.isArray(params.key) ? params.key.join('/') : params.key;
  const obj = await env.R2_BUCKET.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  return new Response(obj.body, { headers });
};
