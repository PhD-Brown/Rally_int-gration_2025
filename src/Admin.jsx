import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { adminLeaderboard, adminPhotos, adminReset } from '@/lib/api'

function fmtTime(s=0){ s=Math.max(0, s|0); const h=String(Math.floor(s/3600)).padStart(2,'0'); const m=String(Math.floor((s%3600)/60)).padStart(2,'0'); const sec=String(s%60).padStart(2,'0'); return h==='00' ? `${m}:${sec}` : `${h}:${m}:${sec}` }

export default function Admin() {
  const [token, setToken] = React.useState(localStorage.getItem('admin_token') || '')
  const [teams, setTeams] = React.useState([])
  const [selected, setSelected] = React.useState(null)
  const [photos, setPhotos] = React.useState([])
  const [cursor, setCursor] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [resetScope, setResetScope] = React.useState('teams');

  const loadLeaders = async () => {
    setError('')
    try {
      const data = await adminLeaderboard()
      setTeams(data)
      if (!selected && data.length) {
        setSelected(data[0])
      }
    } catch (e) {
      setError("Non autorisé. Entre le token d'admin.")
    }
  }

  const loadPhotos = async (reset=true) => {
    if(!selected) return
    setLoading(true); setError('')
    try {
      const res = await adminPhotos(selected.teamId, reset ? '' : cursor)
      setCursor(res.cursor || '')
      setPhotos(prev => reset ? res.items : [...prev, ...res.items])
    } catch (e) {
      setError("Non autorisé. Vérifie le token.")
    } finally {
      setLoading(false)
    }
  }

  const doReset = async () => {
    if (!window.confirm(`Confirmer le reset ${resetScope === 'all' ? 'COMPLET' : resetScope} ?`)) return;
    try {
      await adminReset(resetScope);
      setPhotos([]); setCursor('');
      await loadLeaders();
      if (selected) await loadPhotos(true);
      alert('Réinitialisation effectuée.');
    } catch (e) { alert('Échec du reset (token ?)'); }
  };

  React.useEffect(()=>{ loadLeaders() }, [])
  React.useEffect(()=>{ 
    if(selected) loadPhotos(true) 
  }, [selected])

  const saveToken = () => {
    localStorage.setItem('admin_token', token.trim())
    setError('')
    loadLeaders()
    if (selected) loadPhotos(true)
  }

  const byStation = photos.reduce((acc,p)=>{
    const k = p.stationId || 'UNKNOWN'
    acc[k] = acc[k] || []
    acc[k].push(p)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-lg font-semibold">Admin — Rallye UL</div>
          <div className="flex items-center gap-2">
            <Input placeholder="Admin token" value={token} onChange={e=>setToken(e.target.value)} className="w-48"/>
            <Button onClick={saveToken}>Valider</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-5 gap-4">
        {/* CORRIGÉ : md:col-span-2 au lieu de md-col-span-2 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Classement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && <div className="text-sm text-rose-600">{error}</div>}
            {!teams.length && !error && <div className="text-sm text-slate-500">Aucune équipe pour l’instant.</div>}
            <div className="space-y-2">
              {teams.map(t => (
                <div key={t.teamId}
                     className={`p-3 rounded-xl border cursor-pointer ${selected?.teamId === t.teamId ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}
                     onClick={() => setSelected(t)}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t.rank ? `#${t.rank}` : ''} {t.teamId}</div>
                    <Badge>{t.stations?.length || 0} / 21</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                    <span>Temps: {fmtTime(t.seconds || 0)}</span>
                    <div className="flex-1"><Progress value={((t.stations?.length||0)/21)*100}/></div>
                  </div>
                </div>
              ))}
            </div>
            {/* CORRIGÉ : Le bloc de réinitialisation était manquant */}
            <div className="mt-4 flex items-center gap-2">
              <select className="border rounded-lg px-2 py-1" value={resetScope} onChange={(e) => setResetScope(e.target.value)}>
                <option value="teams">Réinitialiser équipes (KV)</option>
                <option value="photos">Supprimer photos (R2)</option>
                <option value="all">Tout (KV + photos)</option>
              </select>
              <button onClick={doReset} className="px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700">
                Réinitialiser
              </button>
            </div>
          </CardContent>
        </Card>

        {/* CORRIGÉ : md:col-span-3 au lieu de md-col-span-3 */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Photos — {selected?.teamId || 'Aucune équipe sélectionnée'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selected && <div className="text-sm text-slate-500">Sélectionne une équipe à gauche.</div>}
            {selected && Object.keys(byStation).sort().map(st => (
              <div key={st}>
                <div className="mb-2 text-sm font-medium">Station {st}</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(byStation[st] || []).map(ph => (
                    <a key={ph.key} href={ph.url} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border bg-white">
                      <img src={ph.url} alt={ph.filename} className="w-full h-40 object-cover"/>
                      <div className="p-2 text-xs text-slate-600 truncate">{ph.filename}</div>
                    </a>
                  ))}
                </div>
                
                {(() => {
                  if (!selected || !selected.stations) return null;
                  const stationData = selected.stations.find(x => x.id === st);
                  if (!stationData || (!stationData.measurement && !stationData.notes)) return null;
                  
                  return (
                    <div className="text-xs text-slate-700 mt-2 p-3 rounded-lg border bg-slate-50">
                      {stationData.measurement && (
                        <div><strong className="font-medium">Mesure :</strong> {stationData.measurement}</div>
                      )}
                      {stationData.notes && (
                        <div className="mt-1">
                          <strong className="font-medium">Notes :</strong>
                          <p className="whitespace-pre-wrap pl-2">{stationData.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
            {selected && (
              <div className="flex items-center justify-center">
                <Button onClick={()=>loadPhotos(false)} disabled={!cursor || loading}>
                  {loading ? 'Chargement…' : (cursor ? 'Charger plus' : 'Tout chargé')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}