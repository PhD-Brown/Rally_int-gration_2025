import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Users, MapPin, Lock, Unlock, CheckCircle2, Image as ImageIcon, Upload, Clock, ChevronRight, RotateCcw } from 'lucide-react'
import { validateCode, uploadPhoto, registerTeam, pushProgress } from '@/lib/api'
import Admin from './Admin.jsx'


// --- DÉMO DES 21 STATIONS (à adapter) ---
const STATIONS = [
  { id: 'S01', name: 'Serres du Complexe des Serres', clue: "À compléter !", code: 'UL-001', requiresPhoto: false, image: '/indices/serres.jpg' },
  { id: 'S02', name: 'PEPS - La Caverne', clue: "À compléter !", code: 'UL-002', requiresPhoto: false, image: '/indices/la_caverne.jpg' },
  { id: 'S03', name: 'Stade Telus (PEPS)', clue: "À compléter !", code: 'UL-003', requiresPhoto: false, image: '/indices/stade_interieur.jpg' },
  { id: 'S04', name: 'Pavillon Desjardins - Agora', clue: "À compléter !", code: 'UL-004', requiresPhoto: false, image: '/indices/tracteur_desjardins.jpg' },
  { id: 'S05', name: 'Tunnel de Physique', clue: "À compléter !", code: 'UL-005', requiresMeasurement: false, image: '/indices/fresque_physique.jpg' },
  { id: 'S06', name: 'Pavillon Abitibi-Price - Globe Terrestre', clue: "À compléter !", code: 'UL-006', requiresPhoto: false, image: '/indices/globe_abitibi.jpg' },
  { id: 'S07', name: 'Bibliothèque Jean-Charles-Bonenfant', clue: "À compléter !", code: 'UL-007', requiresPhoto: false, image: '/indices/bibliotheque_bonenfant.jpg' },
  { id: 'S08', name: 'Boisé', clue: "À compléter !", code: 'UL-008', requiresPhoto: false, image: '/indices/boise.jpg' },
  { id: 'S09', name: 'Pavillon Vachon - ADÉPUL', clue: "À compléter !", code: 'UL-009', requiresPhoto: false, image: '/indices/adepul.jpg' },
  { id: 'S10', name: 'Pavillon Pouliot - Salle de classe', clue: "À compléter !", code: 'UL-010', requiresPhoto: false, image: '/indices/salle_de_classe.jpg' },
  { id: 'S11', name: 'Cafétéria Pouliot', clue: "À compléter !", code: 'UL-011', requiresMeasurement: false, image: '/indices/cafeteria_pouliot.jpg' },
  { id: 'S12', name: 'Extérieur - Cadran Solaire', clue: "À compléter !", code: 'UL-012', requiresMeasurement: false, image: '/indices/cadran_solaire.jpg' },
  { id: 'S13', name: "Pavillon d'Optique-Photonique (COPL)", clue: "À compléter !", code: 'UL-013', requiresPhoto: false, image: '/indices/corridor_copl.jpg' },
  { id: 'S14', name: 'Pavillon Vachon - Département de Physique', clue: "À compléter !", code: 'UL-014', requiresPhoto: false, image: '/indices/departement_physique.jpg' },
  { id: 'S15', name: 'Pavillon Enviro - Atrium', clue: "À compléter !", code: 'UL-015', requiresPhoto: false, image: '/indices/enviro.jpg' },
  { id: 'S16', name: 'Corridor du Pouliot/Vachon', clue: "À compléter !", code: 'UL-016', requiresPhoto: false, image: '/indices/porte_cote.jpg' },
  { id: 'S17', name: 'Babillard "Festijeu"', clue: "À compléter !", code: 'UL-017', requiresPhoto: false, image: '/indices/festijeu.jpg' },
  { id: 'S18', name: 'Tableau de classe de Physique', clue: "À compléter !", code: 'UL-018', requiresMeasurement: false, image: '/indices/tableau_nerds.jpg' },
  { id: 'S19', name: 'Grand Axe - Fontaine', clue: "À compléter !", code: 'UL-019', requiresMeasurement: false },
  { id: 'S20', name: "PEPS — Mur d'escalade", clue: "À compléter !", code: 'UL-020', requiresPhoto: false },
  { id: 'S21', name: 'Jardin intérieur Vachon', clue: "À compléter !", code: 'UL-021', requiresPhoto: false }
];

function mulberry32(a){return function(){let t=a+=0x6D2B79F5; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296}}
function seededShuffle(arr, seed){const rng=mulberry32(seed||1); const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]} return a}

const STORAGE_KEY = 'ul_rally_state_v1'

export default function RallyeULApp() {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return <Admin />
  }
  const [team, setTeam] = useState([])
  const [memberName, setMemberName] = useState('')
  const [routeNumber, setRouteNumber] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [codeInput, setCodeInput] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [photos, setPhotos] = useState({})
  const [measurements, setMeasurements] = useState({})
  const [notes, setNotes] = useState({})
  const [showTestMode, setShowTestMode] = useState(false)

  React.useEffect(()=>{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(raw){
      try{
        const s = JSON.parse(raw)
        setTeam(s.team || [])
        setRouteNumber(s.routeNumber || '')
        setStartedAt(s.startedAt || null)
        setCurrentIdx(s.currentIdx || 0)
        setMeasurements(s.measurements || {})
        setNotes(s.notes || {})
        setPhotos({})
      }catch(e){}
    }
  },[])

  React.useEffect(()=>{
    const state = { team, routeNumber, startedAt, currentIdx, measurements, notes }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  },[team, routeNumber, startedAt, currentIdx, measurements, notes])

  React.useEffect(()=>{
    if(!startedAt) return
    const id = setInterval(()=> setSeconds(Math.floor((Date.now()-startedAt)/1000)), 1000)
    return ()=> clearInterval(id)
  },[startedAt])

  const order = React.useMemo(()=>{
    const seed = parseInt(routeNumber || '1',10) || 1
    return seededShuffle(STATIONS, seed)
  },[routeNumber])

  const currentStation = order[currentIdx]
  const progressPct = Math.round((currentIdx / STATIONS.length) * 100)

  const addMember = ()=>{
    const name = memberName.trim(); if(!name) return
    setTeam(t => Array.from(new Set([...t, name])))
    setMemberName('')
  }
  const removeMember = (name)=> setTeam(t => t.filter(n => n!==name))

  const startRun = async () => {
    if (team.length === 0) return alert('Ajoutez au moins un membre.');
    if (!routeNumber) return alert('Entrez un numéro de parcours.');

    // démarrer le chrono + reset étape
    setStartedAt(Date.now());
    setCurrentIdx(0);
    setUnlocked(false);
    setCodeInput('');

    // inscrire l’équipe côté serveur (fire-and-forget ok)
    const teamId = team.join('-') || 'anon';
    try { await registerTeam(teamId); } catch (e) { console.warn('registerTeam failed', e); }
  };

  const handleUpload = async (files) => {
    if (!currentStation) return;
    const list = Array.from(files || []);
    if (list.length === 0) return;

    // preview local immédiat
    setPhotos((p) => {
      const cur = p[currentStation.id] || [];
      const add = list.map((file) => ({ file, url: URL.createObjectURL(file), remote: null }));
      return { ...p, [currentStation.id]: [...cur, ...add].slice(0, 6) };
    });

    // upload en arrière-plan vers R2
    const teamId = team.join('-') || 'anon';
    for (const file of list) {
      try {
        const { url } = await uploadPhoto(currentStation.id, teamId, file);
        setPhotos((p) => {
          const arr = (p[currentStation.id] || []).map((x) =>
            x.file === file ? { ...x, remote: url } : x
          );
          return { ...p, [currentStation.id]: arr };
        });
      } catch (e) {
        console.error('Upload failed', e);
      }
    }
  };

  const validateAndUnlock = async () => {
    if (!currentStation) return;

    // exigences (photo/mesure) inchangées
    if (currentStation.requiresPhoto) {
      const hasPhoto = (photos[currentStation.id] || []).length > 0;
      if (!hasPhoto) return alert('Ajoutez au moins une photo pour cette station.');
    }
    if (currentStation.requiresMeasurement) {
      const val = (measurements[currentStation.id] ?? '').toString().trim();
      if (!val) return alert('Entrez la mesure demandée pour cette station.');
    }

    try {
      await validateCode(currentStation.id, codeInput);
      setUnlocked(true);

      const teamId = team.join('-') || 'anon';

      // --- NOUVEAU : on prépare ce qu’on envoie
      const measurement = (measurements[currentStation.id] ?? '').toString().slice(0, 120);
      const notesText   = (notes[currentStation.id] ?? '').toString().slice(0, 2000);

      await pushProgress(teamId, currentStation.id, seconds, {
        measurement,
        notes: notesText,
      });
    } catch {
      alert('Code invalide. Réessayez.');
    }
  };

  const goNext = ()=>{
    if(currentIdx + 1 < STATIONS.length){
      setCurrentIdx(i=>i+1); setUnlocked(false); setCodeInput('')
    }else{ setUnlocked(false); setCodeInput('') }
  }

  const resetAll = ()=>{
    if(!confirm('Réinitialiser complètement le parcours?')) return
    setTeam([]); setMemberName(''); setRouteNumber(''); setStartedAt(null); setSeconds(0); setCurrentIdx(0); setCodeInput(''); setUnlocked(false); setPhotos({}); setMeasurements({}); setNotes({}); localStorage.removeItem(STORAGE_KEY)
  }

  const timeFmt = (s)=>{
    const hh = Math.floor(s/3600).toString().padStart(2,'0')
    const mm = Math.floor((s%3600)/60).toString().padStart(2,'0')
    const ss = Math.floor(s%60).toString().padStart(2,'0')
    return hh==='00' ? `${mm}:${ss}` : `${hh}:${mm}:${ss}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-600/90 grid place-items-center text-white font-bold">UL</div>
            <div>
              <div className="text-lg font-semibold">Rallye UL</div>
              <div className="text-xs text-slate-500">Parcours interactif — Université Laval</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              <span>{startedAt ? timeFmt(seconds) : '00:00'}</span>
            </div>
            <div className="w-28 hidden md:block">
              <Progress value={progressPct} />
            </div>
            <Button variant="secondary" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Réinitialiser
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {!startedAt ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Créez votre équipe</CardTitle>
                <CardDescription>Entrez les membres, le numéro de parcours et démarrez votre aventure. L'ordre des 21 stations sera automatiquement personnalisé.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="md:col-span-3 space-y-3">
                    <label className="text-sm font-medium">Membres de l'équipe</label>
                    <div className="flex items-center gap-2">
                      <Input placeholder="Ajouter un prénom (ex: Alex)" value={memberName} onChange={e=>setMemberName(e.target.value)} onKeyDown={e=> e.key==='Enter' && addMember()} />
                      <Button onClick={addMember} className="gap-2"><Plus className="h-4 w-4"/> Ajouter</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {team.length===0 && (<span className="text-xs text-slate-500">Aucun membre pour l'instant.</span>)}
                      {team.map(name => (
                        <Badge key={name} variant="secondary" className="px-2 py-1 text-sm flex items-center gap-2">
                          {name}
                          <button aria-label={`Retirer ${name}`} onClick={()=>removeMember(name)} className="text-slate-500 hover:text-rose-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-sm font-medium">Numéro de parcours</label>
                    <Input type="number" min={1} max={9999} inputMode="numeric" placeholder="Ex: 12" value={routeNumber} onChange={e=>setRouteNumber(e.target.value)} />
                    <p className="text-xs text-slate-500">Le numéro personnalise l'ordre des stations (déterministe).</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-600">Mode TEST (organisateur)</span>
                    <Switch checked={showTestMode} onCheckedChange={setShowTestMode} />
                  </div>
                  <Button size="lg" onClick={startRun} className="gap-2">
                    Commencer <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4"/>
                <span className="font-medium">Équipe:</span>
                <span>{team.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4"/>
                <span>Étape {currentIdx + 1} / {STATIONS.length}</span>
                <div className="w-24"><Progress value={(currentIdx / STATIONS.length) * 100} /></div>
              </div>
            </div>

            {currentIdx >= STATIONS.length ? (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Parcours terminé 🎉</CardTitle>
                  <CardDescription>Bravo! Montrez cet écran à un organisateur.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-700">
                  <div><span className="font-medium">Équipe:</span> {team.join(', ')}</div>
                  <div><span className="font-medium">Parcours:</span> {routeNumber}</div>
                  <div><span className="font-medium">Durée:</span> {timeFmt(seconds)}</div>
                </CardContent>
                <CardFooter>
                  <Button onClick={resetAll} variant="secondary" className="gap-2"><RotateCcw className="h-4 w-4"/> Recommencer</Button>
                </CardFooter>
              </Card>
            ) : (
              currentStation && (
                <div className="grid md:grid-cols-5 gap-4">
                  <Card className="md:col-span-3 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5"/>
                        {currentStation.name}
                      </CardTitle>
                      <CardDescription>Indice #{currentIdx + 1} — suivez les consignes ci-dessous.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                        <p className="leading-relaxed"><span className="font-semibold">Indice:</span> {currentStation.clue}</p>
                      </div>
                      {currentStation.image && (
                        <div className="mt-4">
                          <img 
                            src={currentStation.image} 
                            alt="Image d'indice" 
                            className="rounded-xl w-full max-h-80 object-cover border" 
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Photo(s) sur place {currentStation.requiresPhoto && <Badge className="ml-2" variant="secondary">Obligatoire</Badge>}</label>
                          <Input type="file" accept="image/*" multiple onChange={(e)=>handleUpload(e.target.files)} capture="environment" className="max-w-xs" />
                        </div>
                        {(photos[currentStation.id]?.length || 0) > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {photos[currentStation.id].map((p, idx) => (
                              <div key={idx} className="aspect-video rounded-xl overflow-hidden border">
                                <img src={p.url} alt={`photo-${idx+1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium">Mesure (si demandé) {currentStation.requiresMeasurement && <Badge className="ml-2" variant="secondary">Obligatoire</Badge>}</label>
                        <Input type="text" placeholder="Ex: 14,2 s  |  200 m  |  12 marches" value={(measurements[currentStation.id] ?? '')} onChange={(e)=> setMeasurements(m => ({ ...m, [currentStation.id]: e.target.value }))} />
                        <Textarea placeholder="Notes facultatives (observations, détails, réponses textuelles)" value={(notes[currentStation.id] ?? '')} onChange={(e)=> setNotes(n => ({ ...n, [currentStation.id]: e.target.value }))} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">Validation du code {showTestMode && (<Badge variant="secondary" className="ml-2">Attendu: {currentStation.code}</Badge>)}</CardTitle>
                      <CardDescription>Saisissez le code affiché à cette station pour déverrouiller la suivante.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input placeholder="Entrez le code ici" value={codeInput} onChange={e=>setCodeInput(e.target.value)} onKeyDown={e=> e.key==='Enter' && validateAndUnlock()} autoFocus />
                      {!unlocked ? (
                        <Button className="w-full gap-2" onClick={validateAndUnlock}>
                          <Lock className="h-4 w-4"/> Valider le code
                        </Button>
                      ) : (
                        <Button className="w-full gap-2" onClick={goNext}>
                          <Unlock className="h-4 w-4"/> Déverrouillé — étape suivante
                        </Button>
                      )}
                      {unlocked && (
                        <div className="flex items-center gap-2 text-emerald-700 text-sm">
                          <CheckCircle2 className="h-4 w-4"/> Code correct! Vous pouvez passer à la prochaine étape.
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="justify-between">
                      <div className="text-xs text-slate-500">Parcours #{routeNumber}</div>
                      <div className="text-xs text-slate-500">Progression: {currentIdx}/{STATIONS.length}</div>
                    </CardFooter>
                  </Card>
                </div>
              )
            )}
          </motion.div>
        )}

        <div className="pt-6 text-center text-xs text-slate-500">Baker is such a beast!!.</div>
      </main>
    </div>
  )
}
