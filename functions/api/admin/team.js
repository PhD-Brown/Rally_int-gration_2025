export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const teamId = url.searchParams.get('teamId');

  // Sécurité : Vérification du token (identique aux autres endpoints admin)
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (env.ADMIN_TOKEN && token !== env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!teamId) {
    return new Response('teamId is required', { status: 400 });
  }

  // On va chercher les données complètes de l'équipe dans KV
  const rawData = await env.RALLYE_KV.get(`team:${teamId}`);
  if (!rawData) {
    return new Response('Team not found', { status: 404 });
  }

  const teamData = JSON.parse(rawData);
  
  return new Response(JSON.stringify(teamData), {
    headers: { 'content-type': 'application/json' },
  });
};