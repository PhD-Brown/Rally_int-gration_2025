# Rallye UL — Frontend (Vite + React + Tailwind)

Prototype prêt pour **Cloudflare Pages**.

## Démarrer en local
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
# sortie: dist/
```

## Déployer sur Cloudflare Pages (UI)
1. Poussez ce dossier sur GitHub (repo privé/public).
2. Dans Cloudflare → Workers & Pages → **Pages** → *Connect to Git*.
3. Sélectionnez le repo.
4. **Build command**: `npm ci && npm run build`  
   **Build output dir**: `dist`
5. Déployez.

## Déployer via CLI (wrangler)
```bash
# 1) Build
npm run build

# 2) Avec wrangler installé
# npm i -g wrangler
wrangler pages deploy dist --project-name=rallye-ul
```

> Les données sont conservées uniquement côté navigateur (localStorage).
