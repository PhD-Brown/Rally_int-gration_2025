import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Users,
  MapPin,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { validateCode, registerTeam, pushProgress } from "@/lib/api";
import Admin from "./Admin.jsx";

/* ======================
   STATIONS (ordre fixe)
   ====================== */
const STATIONS = [
  { id: "S01", name: "Serres", clue: "Jack et le haricot magique", code: "LeSecretDeLaLicorne", image: "/indices/serres.jpg" },
  { id: "S02", name: "Local de l'ADÉPUL", clue: "Trouvez votre local d'asso!", code: "LaFlûteÀSixSchtroumpfs", image: "/indices/adepul.jpg" },
  { id: "S03", name: "Bureau du directeur de programme", clue: "Zoom au-delà de la longuer de Planck", code: "SpirouÀNewYork", image: "/indices/porte_cote.jpg" },
  { id: "S04", name: 'Babillard "Festijeu"', clue: "Revenez sur vos pas!", code: "LesDaltonsSeRachètent", image: "/indices/affiche_festijeux.jpg" },
  { id: "S05", name: "Salle de cours - VCH28XX", clue: "Autant se muscler les cuisses tout de suite", code: "LeMarsupilami", image: "/indices/salle_de_classe.jpg" },
  { id: "S06", name: "Lab d'info", clue: "[Jack et le haricot magique]^[-1]", code: "LeTrésorDeRackhamLeRouge", image: "/indices/tableau_nerds.jpg" },
  { id: "S07", name: "En direction du COPL", clue: "Les corridors du Vachon sont bien longs", code: "LaSerpeDOr", image: "/indices/corridor_copl.jpg" },
  { id: "S08", name: "Bibliothèque scientifique", clue: "Juste en face du département", code: "LeCasLagaffe", image: "/indices/bibli_vachon.jpg" },
  { id: "S09", name: "Colosse", clue: "Le grand silo à grain", code: "FélixVousOffreGénéreusementDesBeignes", image: "/indices/enviro.jpg" },
  { id: "S10", name: "Stade TELUS", clue: "À portée de vue", code: "LEvasionDesDaltons", image: "/indices/stade_interieur.jpg" },
  { id: "S11", name: "PEPS", clue: "Sans grande surprise, également à portée de vue", code: "TintinEtLesPicaros", image: "/indices/peps.jpg" },
  { id: "S12", name: "Tunnels - Jeux de la Physique", clue: "Rendez-vous au PubU!", code: "GareAuxGaffesDuGarsGonflé", image: "/indices/jdlp.jpg" },
  { id: "S13", name: "Agora du Desjardins", clue: "Au fin fin fond du couloir", code: "LHéritageDeRantanplan", image: "/indices/tracteur_desjardins.jpg" },
  { id: "S14", name: "Vous savez où aller!", clue: "La porte sera barrée", code: "AstérixChezLesBretons", image: "/indices/devant_bonenfant.jpg" },
  { id: "S15", name: "Boisé", clue: "Entouré des oiseaux et des écureuils", code: "OkCoral", image: "/indices/boise.jpg" },
  { id: "S16", name: "Grand Axe - Cadran Solaire", clue: "Entouré de gazon et d'asphalte", code: "AstérixEtCléopâtre", image: "/indices/cadran_solaire.jpg" },
  { id: "S17", name: "Globe terrestre", clue: "Le pavillon machiavélique", code: "ObjectifLune", image: "/indices/globe_pouliot.jpg" },
  { id: "S18", name: "Corridor de classe au Pouliot", clue: "À quelque part dans ce labyrinthe", code: "LeSchtroumpfissime", image: "/indices/classe_pouliot.jpg" },
  { id: "S19", name: "Cafétéria", clue: "Sous Terre", code: "LAffaireTournesol", image: "/indices/cafeteria_pouliot.jpg" },
  { id: "S20", name: "Département de Physique", clue: "Juste en face de la biblio", code: "GareAuxGaffes", image: "/indices/departement_physique.jpg" },
];

/* ==========================================
   Dictionnaire Parrain/Marraine → Filleuls
   (listes officielles)
   ========================================== */
const PAIRINGS = {
  "Clément Tremblay": ["Narayan Vigneault", "Marie Gervais", "Laurent Sirois", "Anakin Schroeder Tabah"],
  "Frédérik Strach": ["Fredric Walker", "Camille Ménard", "Leïya Gélinas", "Justin Nadeau"], // Walker (corrigé)
  "Xavier Lemens": ["Alexandre Bourgeois", "Charles-Émile Roy", "Jules Hermel", "Matheus Bernardo-Cunha"],
  "Jean-Frédéric Savard": ["Nassim Naili", "Christophe Renaud-Plourde"],
  "Charles-Antoine Fournier": ["Hany Derriche", "Allyson Landry", "Charles-Étienne Hogue", "Théodore Nadeau"],
  "Anouk Plouffe": ["Charles Plamondon", "Camille Pagé", "Médirck Boudreault"],
  "Félix Dubé": ["Clovis Veilleux", "Guillaume Perron", "Dara Alexis Richer"],
  "Arthur Légaré": ["Zénon Michaud", "Mégane Faucher", "Jacob Bossé"],
  "Mélissa St-Pierre": ["Émilie Dominique Larouche", "Kalel Deschênes", "Tommy Roy"],
  "Jérémie Hatier": ["Florence Roberge", "Sulyvan Côté"],
  "Alex Baker": ["Jérémie Bossé", "Anabelle Sansonetti", "Mathis Couture", "Maxime Leblanc"],
  "Louis Grégoire": ["Philémon Robert", "Émile Denechaud", "Xavier Bilodeau"],
  // Ajoute d'autres parrains au besoin…
};

/* ======================
   Helpers (tri & normalisation)
   ====================== */
const normalizeName = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const lastName = (full) => {
  const parts = full.trim().split(/\s+/);
  return parts.length ? parts[parts.length - 1] : full;
};

const compareByLastName = (a, b) => {
  const la = normalizeName(lastName(a));
  const lb = normalizeName(lastName(b));
  if (la < lb) return -1;
  if (la > lb) return 1;
  const fa = normalizeName(a);
  const fb = normalizeName(b);
  return fa.localeCompare(fb);
};

// Listes déroulantes triées
const ALL_MENTORS = Object.keys(PAIRINGS).sort(compareByLastName);
const ALL_STUDENTS = Array.from(new Set(Object.values(PAIRINGS).flat())).sort(compareByLastName);

// 🔐 Clé de persistance (version 2)
const STORAGE_KEY = "ul_rally_state_v2";

// --- Démarrages par duo de parrains/marraines ---
const pairKey = (a, b) => [a, b].sort().join("|");
/* Interprétation: "indice 2" = 2e étape → index 1 (0-based) */
const START_AT_BY_PAIR = new Map([
  [pairKey("Clément Tremblay", "Frédérik Strach"), 1],     // indice 2
  [pairKey("Xavier Lemens", "Jean-Frédéric Savard"), 4],   // indice 5
  [pairKey("Charles-Antoine Fournier", "Anouk Plouffe"), 8], // indice 9
  [pairKey("Félix Dubé", "Arthur Légaré"), 11],            // indice 12
  [pairKey("Mélissa St-Pierre", "Jérémie Hatier"), 14],    // indice 15
  [pairKey("Alex Baker", "Louis Grégoire"), 18],           // indice 19
]);

// 📌 Bingo (même dossier que les autres indices)
const BINGO_IMG = "/indices/bingo.jpg";

/* ---------- Panneau de débogage ---------- */
function DebugPanel({ team, onTeamChange, stationIdx, onStationIdxChange, onApply, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="shadow-2xl w-full max-w-md">
          <CardHeader>
            <CardTitle>Panneau de Secours</CardTitle>
            <CardDescription>Forcez un état pour une équipe. Idéal pour reprendre après une erreur.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Noms des membres</label>
              <Input
                placeholder="Alex, Cath, ..."
                value={team}
                onChange={(e) => onTeamChange(e.target.value)}
              />
              <p className="text-xs text-slate-500"></p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Repartir à l'indice</label>
              <select
                value={stationIdx}
                onChange={(e) => onStationIdxChange(e.target.value)}
                className="flex h-10 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {STATIONS.map((station, index) => (
                  <option key={station.id} value={index}>
                    Indice #{index + 1}: {station.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
            <Button onClick={onApply}>Appliquer et démarrer</Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function RallyeULApp() {
  // route /admin
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return <Admin />;
  }

  // état global
  const [showDebug, setShowDebug] = useState(false);
  const [debugTeam, setDebugTeam] = useState("");
  const [debugStationIdx, setDebugStationIdx] = useState("0");

  const [team, setTeam] = useState([]);
  const [startedAt, setStartedAt] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [finishedSeconds, setFinishedSeconds] = useState(null);

  // currentIdx = numéro d'étape relative (0 → 19). Après 19, terminé (20 étapes faites).
  const [currentIdx, setCurrentIdx] = useState(0);

  // startIndex = indice absolu (0 → 19) à partir duquel l'équipe commence son parcours circulaire
  const [startIndex, setStartIndex] = useState(0);

  const [codeInput, setCodeInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [showTestMode, setShowTestMode] = useState(false);

  // Sélections pour les menus déroulants
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("");

  // Parrains/marraines — exactement 2 requis
  const [mentors, setMentors] = useState([]);

  // --- LIGHTBOX (zoom + overlay plein écran) ---
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const openLightbox = (src) => { setLightboxSrc(src); setZoom(1); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const zoomIn  = () => setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)));
  const resetZoom = () => setZoom(1);
  const onWheelZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((z) => Math.min(5, Math.max(1, +(z + delta).toFixed(2))));
  };

  // chargement / persistance
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw) || {};
        setTeam(Array.isArray(s.team) ? s.team : []);
        setMentors(Array.isArray(s.mentors) ? s.mentors.slice(0, 2) : []);

        const sa = typeof s.startedAt === "number" && Number.isFinite(s.startedAt) ? s.startedAt : null;
        setStartedAt(sa);

        const ciRaw = typeof s.currentIdx === "number" ? s.currentIdx : 0;
        const siRaw = typeof s.startIndex === "number" ? s.startIndex : 0;

        const ci = Math.max(0, Math.min(ciRaw, STATIONS.length));            // 0..20
        const si = Math.max(0, Math.min(siRaw, STATIONS.length - 1));        // 0..19
        setCurrentIdx(ci);
        setStartIndex(si);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    const state = { team, startedAt, currentIdx, mentors, startIndex };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full / private mode — ignorer
    }
  }, [team, startedAt, currentIdx, mentors, startIndex]);

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  // Étape courante (relative) → index absolu circulaire
  const isFinished = currentIdx >= STATIONS.length; // 20 étapes complétées
  const absoluteIdx = isFinished ? null : (startIndex + currentIdx) % STATIONS.length;
  const currentStation = isFinished ? null : STATIONS[absoluteIdx];

  const progressPct = Math.round((Math.min(currentIdx, STATIONS.length) / STATIONS.length) * 100);
  const stepDisplay = isFinished ? `${STATIONS.length}/${STATIONS.length}` : `${currentIdx + 1} / ${STATIONS.length}`;

  // équipe (étudiants) — via menu déroulant
  const addMember = () => {
    const name = selectedStudent.trim();
    if (!name) return;
    setTeam((t) => Array.from(new Set([...t, name])));
    setSelectedStudent("");
  };
  const removeMember = (name) => setTeam((t) => t.filter((n) => n !== name));

  // parrains/marraines — via menu déroulant
  const addMentor = () => {
    const name = selectedMentor.trim();
    if (!name) return;
    setMentors((m) => {
      const next = Array.from(new Set([...m, name]));
      return next.slice(0, 2); // max 2
    });
    setSelectedMentor("");
  };
  const removeMentor = (name) => setMentors((m) => m.filter((n) => n !== name));

  const applyDebugState = () => {
    const teamNames = debugTeam.split(",").map((n) => n.trim()).filter(Boolean);
    if (teamNames.length === 0) return alert("Entrez au moins un nom d'équipe.");
    const stationIndex = parseInt(debugStationIdx, 10);

    setTeam(teamNames);
    setStartIndex(Math.max(0, Math.min(stationIndex, STATIONS.length - 1))); // départ absolu
    setCurrentIdx(0);            // étape relative = 0
    setStartedAt(Date.now());
    setFinishedSeconds(null); // reset fin
    setUnlocked(false);
    setCodeInput("");
    setShowDebug(false);
  };

  const validateAndUnlock = async () => {
    if (!currentStation) return;
    try {
      await validateCode(currentStation.id, codeInput);
      const teamId = team.join("-") || "anon";
      await pushProgress(teamId, currentStation.id, seconds, {});
      setUnlocked(true);
    } catch (e) {
      alert("Code invalide. Réessayez.");
    }
  };

  // Conversion des 2 noms saisis → clés exactes de PAIRINGS
  const findMentorKeys = (list) => {
    if (!Array.isArray(list) || list.length !== 2) return null;
    const keys = Object.keys(PAIRINGS);
    const found = list.map((n) =>
      keys.find((k) => normalizeName(k) === normalizeName(n))
    );
    if (found.some((x) => !x)) return null;
    if (new Set(found).size !== 2) return null;
    return found;
  };

  // ---- Validation au démarrage ----
  const startRun = async () => {
    if (team.length === 0) {
      alert("Il manque des membres d'équipe.");
      return;
    }
    if (mentors.length !== 2) {
      alert("Veuillez entrer exactement 2 parrains/marraines (via le menu déroulant).");
      return;
    }

    const mentorKeys = findMentorKeys(mentors);
    if (!mentorKeys) {
      alert("Certains des noms de parrains/marraines sont incorrects. Réessayez; si l’erreur persiste, appelez Alex ou Jérémie.");
      return;
    }

    // Union des filleuls autorisés pour ces 2 parrains
    const allowed = mentorKeys.flatMap((k) => PAIRINGS[k] || []);

    // Sets normalisés
    const teamSetNorm = new Set(team.map(normalizeName));
    const allowedSetNorm = new Set(allowed.map(normalizeName));

    // 1) aucun membre hors des 2 listes
    const hasExtras = team.some((x) => !allowedSetNorm.has(normalizeName(x)));
    if (hasExtras) {
      alert("Certains des membres entrés ne sont pas associés à ces parrains/marraines. Si l’erreur persiste, appelez Alex ou Jérémie.");
      return;
    }

    // 2) tous les filleuls des 2 listes doivent être présents
    const missingExists = [...allowedSetNorm].some((norm) => !teamSetNorm.has(norm));
    if (missingExists) {
      alert("Il manque des membres obligatoires pour ces parrains/marraines. Si l’erreur persiste, contactez moi ou Alex.");
      return;
    }

    // OK : démarrer (avec point de départ absolu spécifique au duo)
    const startAbs = START_AT_BY_PAIR.get(pairKey(mentorKeys[0], mentorKeys[1])) ?? 0;
    setStartIndex(startAbs);       // point de départ absolu
    setCurrentIdx(0);              // étape relative = 0 (1/20)
    setFinishedSeconds(null);
    setStartedAt(Date.now());
    setUnlocked(false);
    setCodeInput("");

    try {
      const teamId = team.join("-") || "anon";
      await registerTeam(teamId);
    } catch (e) {
      console.warn("registerTeam failed", e);
    }
  };

  // Étape suivante dans la boucle; fin après 20 étapes (0..19)
  const goNext = () => {
    setCurrentIdx((i) => {
      const next = i + 1;
      if (next >= STATIONS.length) {
        setFinishedSeconds(seconds); // fige le temps à la fin
        setStartedAt(null);          // stoppe le timer
      }
      return next;
    });
    setUnlocked(false);
    setCodeInput("");
  };

  const resetAll = () => {
    if (!confirm("Réinitialiser complètement le parcours?")) return;
    setTeam([]);
    setStartedAt(null);
    setFinishedSeconds(null);
    setSeconds(0);
    setCurrentIdx(0);
    setStartIndex(0);
    setCodeInput("");
    setUnlocked(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setMentors([]);
    setSelectedMentor("");
    setSelectedStudent("");
  };

  const timeFmt = (s) => {
    const hh = Math.floor(s / 3600).toString().padStart(2, "0");
    const mm = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return hh === "00" ? `${mm}:${ss}` : `${hh}:${mm}:${ss}`;
  };

  // Écran de fin
  const FinishedCard = () => (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Félicitations 🎉</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-700">
        <p className="leading-relaxed">
          Félicitations, vous avez complété le rallye en{" "}
          <span className="font-semibold">{timeFmt(finishedSeconds ?? seconds)}</span>!{" "}
          Rendez-vous à la <span className="font-semibold">cafétéria du Vachon</span> vers{" "}
          <span className="font-semibold">17h30</span>. En attendant, complétez le{" "}
          <span className="font-semibold">bingo</span>: ça vaut beaucoup de points pour demain!
        </p>

        {/* Bingo en grand et zoomable */}
        <div className="mt-2">
          <img
            src={BINGO_IMG}
            alt="Bingo"
            className="rounded-xl w-full object-contain border cursor-zoom-in"
            onClick={() => openLightbox(BINGO_IMG)}
            draggable={false}
          />
          <div className="text-xs text-slate-500 mt-1">Cliquez pour agrandir</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={resetAll} variant="secondary" className="gap-2">
          <RotateCcw className="h-4 w-4" /> Recommencer
        </Button>
      </CardFooter>
    </Card>
  );

  // on veut garder la “vue parcours/fin” visible même si startedAt est nul (une fois terminé)
  const inRun = !!startedAt || isFinished;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-600/90 grid place-items-center text-white font-bold">
              UL
            </div>
            <div>
              <div className="text-lg font-semibold">Rallye sur le campus</div>
              <div className="text-xs text-slate-500">
                Rallye d'intégrations en physique — Université Laval
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              <span>{startedAt ? timeFmt(seconds) : finishedSeconds != null ? timeFmt(finishedSeconds) : "00:00"}</span>
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
        {!inRun ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Rejoignez votre équipe!
                </CardTitle>
                <CardDescription>
                  Entrez le nom des membres de votre équipe ainsi que celui de votre parrain/marraine.
                  Votre premier indice viendra par après!
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-5 gap-4">
                  {/* Équipe (étudiants) */}
                  <div className="md:col-span-3 space-y-3">
                    <label className="text-sm font-medium">Membres de l'équipe</label>
                    <div className="flex items-center gap-2">
                      <select
                        className="flex h-10 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm"
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                      >
                        <option value="">— Choisir un nom —</option>
                        {ALL_STUDENTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <Button onClick={addMember} className="gap-2">
                        <Plus className="h-4 w-4" /> Ajouter
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {team.length === 0 && (
                        <span className="text-xs text-slate-500">Aucun membre pour l'instant.</span>
                      )}
                      {team.map((name) => (
                        <Badge
                          key={name}
                          variant="secondary"
                          className="px-2 py-1 text-sm flex items-center gap-2"
                        >
                          {name}
                          <button
                            aria-label={`Retirer ${name}`}
                            onClick={() => removeMember(name)}
                            className="text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Parrains/marraines */}
                  <div className="md:col-span-3 space-y-3">
                    <label className="text-sm font-medium">Parrains/marraines</label>
                    <div className="flex items-center gap-2">
                      <select
                        className="flex h-10 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm"
                        value={selectedMentor}
                        onChange={(e) => setSelectedMentor(e.target.value)}
                      >
                        <option value="">— Choisir un nom —</option>
                        {ALL_MENTORS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <Button onClick={addMentor} className="gap-2">
                        <Plus className="h-4 w-4" /> Ajouter
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {mentors.length === 0 && (
                        <span className="text-xs text-slate-500">Aucun parrain/marraine pour l'instant.</span>
                      )}
                      {mentors.map((name) => (
                        <Badge
                          key={name}
                          variant="secondary"
                          className="px-2 py-1 text-sm flex items-center gap-2"
                        >
                          {name}
                          <button
                            aria-label={`Retirer ${name}`}
                            onClick={() => removeMentor(name)}
                            className="text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
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
          // ÉCRAN DE PARCOURS (boucle circulaire relative au point de départ)
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4" />
                <span className="font-medium">Équipe:</span>
                <span>{team.join(", ")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4" />
                <span>Étape {stepDisplay}</span>
                <div className="w-24">
                  <Progress value={progressPct} />
                </div>
              </div>
            </div>

            {isFinished ? (
              <FinishedCard />
            ) : (
              <div className="grid md:grid-cols-5 gap-4">
                {/* Indice courant */}
                <Card className="md:col-span-3 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {currentStation?.name}
                    </CardTitle>
                    <CardDescription>
                      Indice #{((startIndex + currentIdx) % STATIONS.length) + 1} — suivez les consignes ci-dessous.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                      <p className="leading-relaxed">
                        <span className="font-semibold">Indice:</span> {currentStation?.clue}
                      </p>
                    </div>

                    {currentStation?.image && (
                      <div className="mt-4">
                        {/* Image indice zoomable */}
                        <img
                          src={currentStation.image}
                          alt="Image d'indice"
                          className="rounded-xl w-full object-contain border cursor-zoom-in"
                          onClick={() => openLightbox(currentStation.image)}
                          draggable={false}
                        />
                        <div className="text-xs text-slate-500 mt-1">Cliquez pour agrandir</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Validation */}
                <Card className="md:col-span-2 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Validation du code{" "}
                      {showTestMode && (
                        <Badge variant="secondary" className="ml-2">
                          Attendu: {currentStation?.code}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Saisissez le code affiché à cette station pour déverrouiller la suivante.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      placeholder="Entrez le code ici"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && validateAndUnlock()}
                      autoFocus
                    />
                    {!unlocked ? (
                      <Button className="w-full gap-2" onClick={validateAndUnlock}>
                        <Lock className="h-4 w-4" /> Valider le code
                      </Button>
                    ) : (
                      <Button className="w-full gap-2" onClick={goNext}>
                        <Unlock className="h-4 w-4" /> Déverrouillé — étape suivante
                      </Button>
                    )}
                    {unlocked && (
                      <div className="flex items-center gap-2 text-emerald-700 text-sm">
                        <CheckCircle2 className="h-4 w-4" /> Code exact! Vous pouvez passer à la prochaine étape.
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="justify-between">
                    <div className="text-xs text-slate-500">
                      Progression: {Math.min(currentIdx, STATIONS.length)}/{STATIONS.length}
                    </div>
                  </CardFooter>
                </Card>

                {/* Bingo — toujours visible pendant le parcours */}
                <Card className="md:col-span-2 shadow-sm">
                  <CardHeader>
                    <CardTitle>Bingo (épreuve parallèle)</CardTitle>
                    <CardDescription>Complétez-le pour gagner beaucoup de points!</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={BINGO_IMG}
                      alt="Bingo"
                      className="rounded-xl w-full object-contain border cursor-zoom-in"
                      onClick={() => openLightbox(BINGO_IMG)}
                      draggable={false}
                    />
                    <div className="text-xs text-slate-500 mt-1">Cliquez pour agrandir</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        <div className="pt-6 text-center text-xs text-slate-500">Baker is a beast!</div>

        {/* --- LIGHTBOX OVERLAY : zoom + molette + boutons --- */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col"
            onClick={closeLightbox}
          >
            <div className="flex items-center justify-between p-3 text-white">
              <div className="font-medium">Aperçu</div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={(e)=>{e.stopPropagation(); zoomOut();}}>-</Button>
                <Button variant="secondary" size="sm" onClick={(e)=>{e.stopPropagation(); resetZoom();}}>100%</Button>
                <Button variant="secondary" size="sm" onClick={(e)=>{e.stopPropagation(); zoomIn();}}>+</Button>
                <Button variant="secondary" size="sm" onClick={(e)=>{e.stopPropagation(); closeLightbox();}}>Fermer</Button>
              </div>
            </div>
            <div
              className="flex-1 overflow-auto"
              onClick={(e)=>e.stopPropagation()}
              onWheel={onWheelZoom}
            >
              <div className="min-h-full min-w-full flex items-center justify-center p-6">
                <img
                  src={lightboxSrc || ""}
                  alt="Agrandissement"
                  className="select-none"
                  style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        )}

        {showDebug && (
          <DebugPanel
            team={debugTeam}
            onTeamChange={setDebugTeam}
            stationIdx={debugStationIdx}
            onStationIdxChange={setDebugStationIdx}
            onApply={applyDebugState}
            onClose={() => setShowDebug(false)}
          />
        )}
      </main>
    </div>
  );
}
