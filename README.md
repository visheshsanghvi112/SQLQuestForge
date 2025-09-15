# SQL Mastery Challenge

Practice SQL through 100 progressive levels with instant feedback. React + TypeScript frontend with an Express API and in-memory SQLite per session.

## Tech Stack
- Client: React, Vite, Tailwind, shadcn/ui
- Server: Express, better-sqlite3
- State: TanStack Query
- Types: Zod shared schemas
- Hosting: Vercel (static client + serverless API)

## Local Development
```bash
# 1) Install
npm install

# 2) Dev (Vite served through Express)
npm run dev

# 3) Build client + server
npm run build

# 4) Start production server (local)
npm run start
```
Notes (Windows): we use `cross-env` so NODE_ENV works in Windows shells.

## Project Structure
```
client/          # React app (Vite)
  public/        # Static assets (manifest, icons, robots, sitemap)
  src/           # Components, hooks, pages
server/          # Express server + services
  services/      # SQL engine, level manager
shared/          # Zod schemas shared by client/server
api/server.ts    # Vercel serverless API entry
vercel.json      # Vercel builds + routing
```

## Levels
- Server defines levels 1–100. Each level provides tables, data, expected result, and 3 progressive hints.
- Schema supports `story`, `objectives`, and `starterQuery`.

## Environment
Create a `.env` (local) or set project variables in your host:
```
GEMINI_API_KEY=your_google_generative_ai_key
# optional
PORT=5000
```
Windows PowerShell local run:
```
$env:GEMINI_API_KEY="your_key"; npm run dev
```

## Vercel Deployment
1) Ensure icons exist in `client/public/icons/`:
   - `favicon.ico`, `icon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `maskable-512.png`
2) Push to GitHub. Import the repo into Vercel.
3) Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
4) `vercel.json` is configured to:
   - Build static client via `@vercel/static-build`
   - Route `/api/*` to serverless function `api/server.ts`
   - Serve SPA fallback for any route to prevent 404 on refresh

### Preventing SPA 404 on refresh
We include a catch‑all rewrite so client routes are served via `index.html`:
```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/api/(.*)", "dest": "/api/server.ts" },
    { "src": "/(.*)", "dest": "/dist/public/index.html" }
  ]
}
```

## SEO
- `client/index.html` has title/description, canonical, OpenGraph/Twitter tags
- `client/public/manifest.webmanifest`, `robots.txt`, `sitemap.xml` included
- Update canonical and sitemap URLs to your real domain after deploy

## Theming
- Dark/Light theme via `next-themes`; toggle in the footer

## Accessibility & Responsiveness
- Mobile-first layout with improved spacing on small screens
- Larger touch targets in footer controls

## Troubleshooting
- Windows "NODE_ENV not recognized": fixed via `cross-env`
- Vercel 404 on direct URL: ensured SPA fallback in `vercel.json`
- Icons missing: add files under `client/public/icons/` per the names above

## License
MIT
