// Simple table côté serveur (tu peux la déplacer plus tard en KV/D1)
const CODE_MAP = {
S01:'LeSecretDeLaLicorne', S02:'LaFlûteÀSixSchtroumpfs', S03:'SpirouÀNewYork', S04:'LesDaltonsSeRachètent', S05:'LeMarsupilami', 
  S06:'LeTrésorDeRackhamLeRouge', S07:'LaSerpeDOr', S08:'LeCasLagaffe', S09:'FélixVousOffreGénéreusementDesBeignes', S10:'LEvasionDesDaltons', 
  S11:'TintinEtLesPicaros', S12:'GareAuxGaffesDuGarsGonflé', S13:'LHéritageDeRantanplan', S14:'AstérixChezLesBretons', S15:'OkCoral', 
  S16:'AstérixEtCléopâtre', S17:'ObjectifLune', S18:'LeSchtroumpfissime', S19:'LAffaireTournesol', S20:'GareAuxGaffes', 
  }

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
