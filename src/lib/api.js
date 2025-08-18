export async function validateCode(stationId, code) {
  const res = await fetch('/api/validate-code', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ stationId, code }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error('INVALID_CODE');
  return data;
}

export async function uploadPhoto(stationId, teamId, file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('stationId', stationId);
  fd.append('teamId', teamId);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error('UPLOAD_FAILED');
  return data; // { key, url }
}

export async function registerTeam(teamId) {
  await fetch('/api/register-team', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ teamId }),
  });
}

export async function pushProgress(teamId, stationId, seconds) {
  await fetch('/api/progress', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ teamId, stationId, seconds }),
  });
}

// ---- admin helpers ----
function adminHeaders() {
  const t = localStorage.getItem('admin_token') || '';
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function adminLeaderboard() {
  // si tu as créé /api/admin/leaderboard, utilise-le ; sinon /api/progress
  const res = await fetch('/api/admin/leaderboard', { headers: adminHeaders() });
  if (!res.ok) throw new Error('UNAUTHORIZED');
  return res.json();
}

export async function adminPhotos(teamId, cursor = '') {
  const params = new URLSearchParams();
  if (teamId) params.set('teamId', teamId);
  if (cursor) params.set('cursor', cursor);
  const res = await fetch(`/api/admin/photos?${params.toString()}`, {
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error('UNAUTHORIZED');
  return res.json(); // { items, cursor, truncated }
}

function adminHeaders() {
  const t = localStorage.getItem('admin_token') || '';
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function adminReset(scope='teams') {
  const res = await fetch('/api/admin/reset', {
    method: 'POST',
    headers: { 'content-type':'application/json', ...adminHeaders() },
    body: JSON.stringify({ scope, confirm: 'RESET' }),
  });
  if (!res.ok) throw new Error('RESET_FAILED');
  return res.json();
}