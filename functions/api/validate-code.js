// Simple table côté serveur (tu peux la déplacer plus tard en KV/D1)
const CODE_MAP = {
  S01: 'UL-001', S02: 'UL-002', S03: 'UL-003', S04: 'UL-004', S05: 'UL-005',
  S06: 'UL-006', S07: 'UL-007', S08: 'UL-008', S09: 'UL-009', S10: 'UL-010',
  S11: 'UL-011', S12: 'UL-012', S13: 'UL-013', S14: 'UL-014', S15: 'UL-015',
  S16: 'UL-016', S17: 'UL-017', S18: 'UL-018', S19: 'UL-019', S20: 'UL-020',
  S21: 'UL-021',
};

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
