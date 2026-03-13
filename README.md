# Wordle Clone

## Convex scoreboard integration

This project persists player scores with Convex and uses `localStorage` as an offline fallback.

## Convex words dictionary

- The Wordle dictionary is now stored in Convex (`words` table), grouped by `language`.
- Current supported language: `en`.
- The frontend fetches dictionary words from Convex only when local cache is empty, then stores them in `localStorage` (`wordle:dictionary:en`).
- In Home, there is a `Words` button next to `Refresh` to open the list of possible words.

### 1) Create and run Convex backend

```bash
npm run convex:dev
```

This command initializes the Convex project (first run), generates `convex/_generated/*`, and starts the Convex dev backend.

### 2) Frontend environment

Create a `.env.local` file:

```bash
VITE_CONVEX_URL=https://YOUR-DEPLOYMENT.convex.cloud
```

If `VITE_CONVEX_URL` is missing, the app still works and stores scoreboard data only in `localStorage`.

### 3) Run app

```bash
npm run dev
```

## Game persistence behavior

- The current board is saved in `localStorage` (`wordle:game`).
- Each browser tab has its own session id in `sessionStorage` (`wordle:session-id`).
- Same tab + refresh: the game restores automatically.
- New tab + existing in-progress board from another tab session: the app shows a dialog asking whether to continue that previous board or start a new one.
