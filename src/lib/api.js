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
