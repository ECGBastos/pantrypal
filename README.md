# PantryPal

PantryPal is a mobile-first Progressive Web App for a small household shopping list and lightweight home inventory. It is designed for private self-hosting on a NAS, with no Vercel, Firebase, Supabase, uploads volume, or managed backend required for the MVP.

## Architecture

Next.js with the App Router and TypeScript is a good fit for this NAS-hosted PWA because it can run as a normal Node server in Docker, produce a standalone production build, serve an installable app shell, and keep persistence server-side without vendor lock-in.

SQLite is the MVP database. For a two-person household, writes are small, backups are a single database file, and Docker deployment is much simpler than operating PostgreSQL. The schema keeps household/user ownership explicit so a later PostgreSQL move is straightforward if multi-household scale or heavier concurrent writes become important.

## Features

- Fast grouped shopping list with quantities, notes, check/uncheck, delete, recent items, and bought-item collapse.
- Lightweight inventory grouped by location with quick add, +/- quantity controls, running-low state, and add-to-shopping actions.
- Local rule-based suggestions from running-low inventory and frequently bought known items.
- Photo-assisted inventory flow with camera/file input, temporary preview, mock analysis, editable review, and manual fallback.
- Settings with household user switcher, notification preferences, PWA guidance, and privacy notes.
- PWA manifest and service worker for installability and basic offline shell caching.

## Local Development

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`. The app starts at `/shopping`.

Useful commands:

```bash
npm run typecheck
npm test
npm run build
```

## Docker / NAS Deployment

```bash
cp .env.example .env
docker compose up -d --build
```

The app listens on `${PORT:-3000}` and stores SQLite at `/data/pantrypal.db` inside the `pantrypal_data` Docker volume.

Example NAS environment:

```env
PORT=3000
APP_URL=https://pantry.example.com
DATABASE_URL=file:/data/pantrypal.db
ENABLE_EXTERNAL_IMAGE_ANALYSIS=false
IMAGE_ANALYSIS_PROVIDER=mock
SEED_DEMO_DATA=false
```

Back up only the Docker volume/database file. There is no uploads volume and no photo storage directory.

## Photo Privacy

Photos are not saved permanently. The selected photo exists in browser memory as an object URL, then as a temporary multipart request payload for analysis. The server endpoint does not write images to disk, the database, logs, backups, an uploads folder, or the Docker volume. Only user-confirmed inventory fields are persisted.

External image analysis is off by default:

```env
ENABLE_EXTERNAL_IMAGE_ANALYSIS=false
IMAGE_ANALYSIS_PROVIDER=mock
```

If a future provider such as OpenAI vision is enabled, document it clearly: images will leave the NAS during processing and must remain opt-in.

## Notifications

Notifications are optional. The MVP stores notification preferences and includes service worker push handlers, but full web-push delivery with VAPID keys is intentionally left as a later step. On iPhone, web push requires the app to be added to the Home Screen on iOS/iPadOS 16.4+; normal Safari tabs should not be assumed to receive push.

## Security Notes

- Do not commit `.env`, secrets, SQLite databases, logs, or generated images.
- Use HTTPS for remote access.
- Prefer VPN or a secure reverse proxy outside the local network.
- Keep runtime data inside the Docker database volume.
- There are no admin/debug production routes.

## Git Workflow

```bash
git status
git remote -v
git add .
git commit -m "Initial household shopping and inventory PWA MVP"
git push origin main
```

If your repository uses a different default branch, push that branch instead.

## Future Work

- Replace the MVP user switcher with real authentication, such as a shared household PIN first and proper users later.
- Add real-time sync between phones with polling or WebSockets.
- Add VAPID subscriptions and scheduled web-push delivery.
- Add OpenAI vision, local vision, OCR, or barcode providers behind the existing image-analysis interface.
- Add richer offline mutation queues if the app is used away from the NAS.
