import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Trash2, Users, MapPin, Lock, Unlock, CheckCircle2, Clock, ChevronRight, RotateCcw,
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
  { id: "S05", name: "Salle de cours", clue: "Autant se muscler les cuisses tout de suite", code: "LeMarsupilami", image: "/indices/salle_de_classe.jpg" },
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
   Dictionnaire Parrain → 4 filleuls (à remplir)
   Tu peux mettre 1 ou 2 parrains dans le champ ;
   si 2, on attend l’union de leurs 2×4 filleuls.
   ========================================== */
const PAIRINGS = {
  "Clément Tremblay": ["Narayan Vigneault", "Marie Gervais","Laurent Sirois", "Anakin Schroeder Tabah"],
  "Frédérik Strach": ["Fredric Waler", "Camille Ménard", "Leïya Gélinas", "Justin Nadeau"],
  "Xavier Lemens": ["Alexandre Bourgeois", "Charles-Émile Roy", "Jules Hermel", "Matheus Bernardo-Cunha"],
  "Jean-Frédéric Savard": ["Nassim Naili","Christophe Renaud-Plourde"],
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

// ---- Helpers ----
const normalizeName = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const STORAGE_KEY = "ul_rally_state_v1";

// accepte séparateurs: virgule, &, +, slash, " et "
const parseMentorNames = (raw) =>
  raw
    .split(/(?:,|&|\+|\/| et )/i)
    .map((x) => x.trim())
    .filter(Boolean);

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
              <Input placeholder="Alex, Cath, ..." value={team} onChange={(e) => onTeamChange(e.target.value)} />
              <p className="text-xs text-slate-500">Séparez les noms par une virgule.</p>
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
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return <Admin />;
  }

  const [showDebug, setShowDebug] = useState(false);
  const [debugTeam, setDebugTeam] = useState("");
  const [debugStationIdx, setDebugStationIdx] = useState("0");

  const [team, setTeam] = useState([]);
  const [memberName, setMemberName] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [codeInput, setCodeInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [showTestMode, setShowTestMode] = useState(false);

  const [mentor, setMentor] = useState("");
  const [mentorSaved, setMentorSaved] = useState("");

  const addMentor = () => {
    const name = mentor.trim();
    if (!name) return;
    setMentorSaved(name);
    setMentor("");
  };
  const clearMentor = () => setMentorSaved("");

  // chargement / persistance
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw);
        setTeam(s.team || []);
        setStartedAt(s.startedAt || null);
        setCurrentIdx(s.currentIdx || 0);
      } catch {}
    }
    const m = localStorage.getItem("mentor");
    if (m) setMentorSaved(m);
  }, []);

  useEffect(() => {
    const state = { team, startedAt, currentIdx };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [team, startedAt, currentIdx]);

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const currentStation = STATIONS[currentIdx];
  const progressPct = Math.round((currentIdx / STATIONS.length) * 100);

  const addMember = () => {
    const name = memberName.trim();
    if (!name) return;
    setTeam((t) => Array.from(new Set([...t, name])));
    setMemberName("");
  };
  const removeMember = (name) => setTeam((t) => t.filter((n) => n !== name));

  const applyDebugState = () => {
    const teamNames = debugTeam.split(",").map((n) => n.trim()).filter(Boolean);
    if (teamNames.length === 0) return alert("Entrez au moins un nom d'équipe.");
    const stationIndex = parseInt(debugStationIdx, 10);

    setTeam(teamNames);
    setCurrentIdx(stationIndex);
    setStartedAt(Date.now());
    setUnlocked(false);
    setCodeInput("");
    setShowDebug(false);
  };

  const validateAndUnlock = async () => {
    if (!currentStation) return;
    try {
      await validateCode(currentStation.id, codeInput);
      const teamId = team.join("-") || "anon";
      await pushProgress(teamId, currentStation.id, seconds, {}); // plus de photos/notes/mesures
      setUnlocked(true);
    } catch (e) {
      alert("Code invalide. Réessayez.");
    }
  };

  // Trouve les clés de parrains correspondant au texte saisi (1 ou 2)
  const findMentorKeys = (raw) => {
    const names = parseMentorNames(raw);
    if (names.length === 0) return [];
    const keys = Object.keys(PAIRINGS);
    const found = [];
    for (const n of names) {
      const norm = normalizeName(n);
      const k = keys.find((k) => normalizeName(k) === norm);
      if (!k) return null; // un nom inconnu
      found.push(k);
    }
    // empêcher doublon si la personne tape 2x le même nom
    return Array.from(new Set(found));
  };

  // ---- Validation au démarrage ----
  const startRun = async () => {
    if (team.length === 0) {
      alert("Il manque des membres d'équipe.");
      return;
    }
    if (!mentorSaved.trim()) {
      alert("Veuillez entrer le nom de votre parrain/marraine.");
      return;
    }

    const mentorKeys = findMentorKeys(mentorSaved);
    if (!mentorKeys) {
      const available = Object.keys(PAIRINGS).join(", ");
      alert(`Nom de parrain/marraine non reconnu.\nParrains/marraines possibles : ${available || "(à remplir dans le code)"}`);
      return;
    }
    if (mentorKeys.length > 2) {
      alert("Vous ne pouvez sélectionner qu'un ou deux parrains/marraines.");
      return;
    }

    // Liste attendue = union des filleuls des 1–2 parrains choisis
    const expected = mentorKeys.flatMap((k) => PAIRINGS[k] || []);
    const expectedSet = new Set(expected.map(normalizeName));
    const teamSet = new Set(team.map(normalizeName));

    // Correspondance exacte
    if (teamSet.size !== expectedSet.size ||
        expected.some((x) => !teamSet.has(normalizeName(x))) ||
        team.some((x) => !expectedSet.has(normalizeName(x)))) {

      // Détails manquants / en trop
      const missing = expected.filter((x) => !teamSet.has(normalizeName(x)));
      const extras = team.filter((x) => !expectedSet.has(normalizeName(x)));
      let msg = "La composition de l'équipe ne correspond pas aux filleuls associés au(x) parrain(s) choisi(s).";
      if (missing.length) msg += `\nManquants : ${missing.join(", ")}`;
      if (extras.length) msg += `\nNon attendus : ${extras.join(", ")}`;
      alert(msg);
      return;
    }

    // OK : démarrer
    setStartedAt(Date.now());
    setCurrentIdx(0);
    setUnlocked(false);
    setCodeInput("");

    try {
      const teamId = team.join("-") || "anon";
      await registerTeam(teamId);
    } catch (e) {
      console.warn("registerTeam failed", e);
    }

    // On persiste le texte saisi (pour retrouver le duo si besoin)
    localStorage.setItem("mentor", mentorSaved.trim());
  };

  const goNext = () => {
    if (currentIdx + 1 < STATIONS.length) {
      setCurrentIdx((i) => i + 1);
      setUnlocked(false);
      setCodeInput("");
    } else {
      setUnlocked(false);
      setCodeInput("");
    }
  };

  const resetAll = () => {
    if (!confirm("Réinitialiser complètement le parcours?")) return;
    setTeam([]);
    setMemberName("");
    setStartedAt(null);
    setSeconds(0);
    setCurrentIdx(0);
    setCodeInput("");
    setUnlocked(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("mentor");
    setMentor("");
    setMentorSaved("");
  };

  const timeFmt = (s) => {
    const hh = Math.floor(s / 3600).toString().padStart(2, "0");
    const mm = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return hh === "00" ? `${mm}:${ss}` : `${hh}:${mm}:${ss}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-600/90 grid place-items-center text-white font-bold">UL</div>
            <div>
              <div className="text-lg font-semibold">Rallye sur le campus</div>
              <div className="text-xs text-slate-500">Rallye d'intégrations en physique — Université Laval</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              <span>{startedAt ? timeFmt(seconds) : "00:00"}</span>
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
                  {/* Équipe */}
                  <div className="md:col-span-3 space-y-3">
                    <label className="text-sm font-medium">Membres de l'équipe</label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Ajouter un prénom (ex: Alex Baker)"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addMember()}
                      />
                      <Button onClick={addMember} className="gap-2">
                        <Plus className="h-4 w-4" /> Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {team.length === 0 && (
                        <span className="text-xs text-slate-500">Aucun membre pour l'instant.</span>
                      )}
                      {team.map((name) => (
                        <Badge key={name} variant="secondary" className="px-2 py-1 text-sm flex items-center gap-2">
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

                  {/* Parrain/Marraine (1 ou 2 noms) */}
                  <div className="md:col-span-3 space-y-3">
                    <label className="text-sm font-medium">Parrain/marraine (1 ou 2 noms)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Ex: Clément & Frédérik"
                        value={mentor}
                        onChange={(e) => setMentor(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addMentor()}
                        disabled={!!mentorSaved}
                      />
                      <Button onClick={addMentor} className="gap-2" disabled={!!mentorSaved}>
                        <Plus className="h-4 w-4" /> Ajouter
                      </Button>
                      {mentorSaved && (
                        <Button variant="outline" onClick={clearMentor} className="gap-2">
                          <Trash2 className="h-4 w-4" /> Retirer
                        </Button>
                      )}
                    </div>
                    <div className="pt-1">
                      {mentorSaved ? (
                        <Badge variant="secondary" className="px-2 py-1 text-sm">
                          Parrain(s) : {mentorSaved}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-500">Séparez deux noms par “&”, “,” ou “et”.</span>
                      )}
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
          // ÉCRAN DE PARCOURS (ordre fixe)
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4" />
                <span className="font-medium">Équipe:</span>
                <span>{team.join(", ")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4" />
                <span>Étape {currentIdx + 1} / {STATIONS.length}</span>
                <div className="w-24">
                  <Progress value={(currentIdx / STATIONS.length) * 100} />
                </div>
              </div>
            </div>

            {currentIdx >= STATIONS.length ? (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Parcours terminé 🎉</CardTitle>
                  <CardDescription>Bravo! Montrez cet écran à un organisateur.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-700">
                  <div><span className="font-medium">Équipe:</span> {team.join(", ")}</div>
                  <div><span className="font-medium">Durée:</span> {timeFmt(seconds)}</div>
                </CardContent>
                <CardFooter>
                  <Button onClick={resetAll} variant="secondary" className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Recommencer
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              currentStation && (
                <div className="grid md:grid-cols-5 gap-4">
                  <Card className="md:col-span-3 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {currentStation.name}
                      </CardTitle>
                      <CardDescription>
                        Indice #{currentIdx + 1} — suivez les consignes ci-dessous.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                        <p className="leading-relaxed">
                          <span className="font-semibold">Indice:</span> {currentStation.clue}
                        </p>
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
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Validation du code{" "}
                        {showTestMode && (
                          <Badge variant="secondary" className="ml-2">
                            Attendu: {currentStation.code}
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
                          <CheckCircle2 className="h-4 w-4" /> Code correct! Vous pouvez passer à la prochaine étape.
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="justify-between">
                      <div className="text-xs text-slate-500">
                        Progression: {currentIdx}/{STATIONS.length}
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              )
            )}
          </motion.div>
        )}

        <div className="pt-6 text-center text-xs text-slate-500">Baker is such a beast!!.</div>

        {showDebug && (
          <DebugPanel
            team={debugTeam}
            onTeamChange={setDebugTeam}
            stationIdx={debugStationIdx}
            onStationIdxChange={setDebugStationIdx}
            onApply={() => {
              const teamNames = debugTeam.split(",").map((n) => n.trim()).filter(Boolean);
              if (teamNames.length === 0) return alert("Entrez au moins un nom d'équipe.");
              setTeam(teamNames);
              setCurrentIdx(parseInt(debugStationIdx, 10));
              setStartedAt(Date.now());
              setUnlocked(false);
              setCodeInput("");
              setShowDebug(false);
            }}
            onClose={() => setShowDebug(false)}
          />
        )}
      </main>
    </div>
  );
}
