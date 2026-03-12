# Wordle Clone

## Convex scoreboard integration

This project persists player scores with Convex and uses `localStorage` as an offline fallback.

### 1) Create and run Convex backend

```bash
npm run convex:dev
```

This command initializes the Convex project (first run), generates `convex/_generated/*`, and starts the Convex dev backend.

### 2) Frontend environment

Create a `.env.local` file:

```bash
VITE_CONVEX_URL=https://YOUR-DEPLOYMENT.convex.cloud
VITE_SCORE_LIMIT=10
VITE_WORDLE_GAME_STORAGE_KEY=wordle:game
```

If `VITE_CONVEX_URL` is missing, the app still works and stores scoreboard data only in `localStorage`.

### 3) Run app

```bash
npm run dev
```

## Game persistence behavior

- The current board is saved in `localStorage` (`VITE_WORDLE_GAME_STORAGE_KEY`).
- Each browser tab has its own session id in `sessionStorage` (`wordle:session-id`).
- Same tab + refresh: the game restores automatically.
- New tab + existing in-progress board from another tab session: the app shows a dialog asking whether to continue that previous board or start a new one.
