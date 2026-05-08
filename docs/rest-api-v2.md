# REST API v2 — Frontend Migration Guide

Backend now exposes a RESTful surface under `/api/v2/...` alongside the legacy
action-style endpoints (`/api/db/...`) and the Convex compat layer
(`/api/query`, `/api/mutation`). Legacy is **not removed** — frontend can
migrate incrementally.

## Conventions

- Base URL: `<backend-origin>/api/v2`
- All requests/responses are `application/json`.
- Identity is provided in the body (`clientId`, `clientRecordId`) or query
  string, same as before.
- Status codes:
  - `200` success
  - `201` resource created
  - `400` validation error
  - `404` resource not found
  - `409` conflict (e.g. shield not available)

## Scores — `/api/v2/scores`

| Method  | Path                   | Purpose               | Replaces                                   |
| ------- | ---------------------- | --------------------- | ------------------------------------------ |
| `POST`  | `/`                    | Record a new score    | `POST /api/db/scores/add-score`            |
| `PATCH` | `/`                    | Update existing score | `POST /api/db/scores/update-score`         |
| `GET`   | `/top`                 | Leaderboard           | `GET /api/db/scores/top`                   |
| `POST`  | `/round-events`        | Sync round events     | `POST /api/db/scores/sync-round-events`    |
| `POST`  | `/shield-consumptions` | Consume daily shield  | `POST /api/db/scores/consume-daily-shield` |

### `POST /scores`

```json
// body
{
  "clientId": "...",
  "clientRecordId": "...",
  "nick": "alice",
  "language": "es",
  "modeId": "classic",
  "score": 1200,
  "streak": 3,
  "createdAt": 1715000000000
}
// 201 → { "ok": true, "id": "score_..." }
```

### `GET /scores/top`

Query: `?limit=10&language=es&modeId=classic&clientId=...&clientRecordId=...`

Returns `TopScoresResponseDto` shape (unchanged).

## Players — `/api/v2/players`

The old monolithic `upsert-player-profile` is split into purpose-specific
endpoints. Pick the one matching the user action.

| Method  | Path                           | Purpose                          | Replaces                                                    |
| ------- | ------------------------------ | -------------------------------- | ----------------------------------------------------------- |
| `POST`  | `/`                            | Register a new profile           | `POST /api/db/scores/upsert-player-profile` (creation case) |
| `GET`   | `/me`                          | Current profile                  | `GET /api/db/scores/current-player-profile`                 |
| `PATCH` | `/me/nick`                     | Rename                           | (was bundled in upsert)                                     |
| `PATCH` | `/me/preferences`              | Language / difficulty / keyboard | (was bundled in upsert)                                     |
| `PUT`   | `/me/tutorial-prompts/:modeId` | Mark tutorial seen               | (was bundled in upsert)                                     |
| `GET`   | `/nick-availability`           | Check nick free                  | `GET /api/db/scores/is-nick-available`                      |
| `GET`   | `/:code`                       | Public profile by code           | `GET /api/db/scores/player-by-code`                         |
| `POST`  | `/backfill-codes`              | Admin backfill                   | `POST /api/db/scores/backfill-player-codes`                 |

### `POST /players` — register

Use on first registration only.

```json
{
  "clientId": "...",
  "clientRecordId": "...",
  "nick": "alice",
  "language": "es",
  "difficulty": "normal",
  "keyboardPreference": "qwerty"
}
// 201 → PlayerProfileResponseDto
```

### `PATCH /players/me/nick`

```json
{
  "clientId": "...",
  "clientRecordId": "...",
  "nick": "newnick",
  "language": "es"
}
// 200 → PlayerProfileResponseDto
```

Errors: `400` if profile not resolvable, `404` if no profile, `409` if nick taken.

### `PATCH /players/me/preferences`

At least one of `language`, `difficulty`, `keyboardPreference` is required.

```json
{
  "clientId": "...",
  "clientRecordId": "...",
  "difficulty": "hard",
  "keyboardPreference": "azerty"
}
// 200 → PlayerProfileResponseDto
```

### `PUT /players/me/tutorial-prompts/:modeId`

Idempotent — call when the user dismisses the tutorial prompt for a mode.
`modeId` must be one of: `classic`, `lightning`, `zen`, `daily`.

```json
// body
{
  "clientId": "...",
  "clientRecordId": "..."
}
// 200 → PlayerProfileResponseDto (with tutorialPromptSeenModes updated)
```

### `GET /players/me`

Query: `?clientId=...&clientRecordId=...&language=es`
Returns `PlayerProfileResponseDto` or `null`.

### `GET /players/nick-availability`

Query: `?nick=alice&clientId=...&clientRecordId=...`
Returns `{ "available": true }`.

### `GET /players/:code`

Path `:code` is the public player code. `404` if not found.

## Challenges — `/api/v2/challenges`

| Method   | Path           | Purpose          | Replaces                                        |
| -------- | -------------- | ---------------- | ----------------------------------------------- |
| `GET`    | `/`            | List all         | `GET /api/db/challenges/all`                    |
| `GET`    | `/today`       | Today's daily    | `GET /api/db/challenges/today`                  |
| `GET`    | `/progress`    | Player progress  | `GET /api/db/challenges/player-progress`        |
| `DELETE` | `/progress`    | Reset progress   | `POST /api/db/challenges/reset-player-progress` |
| `POST`   | `/daily`       | Generate daily   | `POST /api/db/challenges/generate-daily`        |
| `PUT`    | `/daily`       | Regenerate daily | `POST /api/db/challenges/regenerate-daily`      |
| `POST`   | `/completions` | Mark complete    | `POST /api/db/challenges/complete`              |
| `POST`   | `/seed`        | Admin seed       | `POST /api/db/challenges/seed`                  |

`DELETE /progress` keeps a body (`{ clientId, date }`) since the resource
is identified by both fields, not a single id.

## Words — `/api/v2/words`

| Method | Path                | Purpose            | Replaces                                       |
| ------ | ------------------- | ------------------ | ---------------------------------------------- |
| `GET`  | `/`                 | List by language   | `GET /api/db/words/by-language`                |
| `GET`  | `/checksum`         | Language checksum  | `GET /api/db/words/language-checksum`          |
| `POST` | `/seed`             | Seed words         | `POST /api/db/words/seed-language-words`       |
| `POST` | `/ensure-seeded`    | Seed if empty      | `POST /api/db/words/ensure-language-seeded`    |
| `POST` | `/checksum/refresh` | Recompute checksum | `POST /api/db/words/refresh-language-checksum` |

All accept `language` in query (GET) or body (POST).

## Admin — `/api/v2/admin`

| Method | Path          | Purpose             | Replaces                           |
| ------ | ------------- | ------------------- | ---------------------------------- |
| `GET`  | `/db/status`  | Counts + empty flag | `GET /api/db/admin/db-status`      |
| `POST` | `/db/imports` | Import backup       | `POST /api/db/admin/import-backup` |

## Migration checklist

1. Replace each legacy URL one feature at a time. Same body shapes — only
   path + verb change in most cases.
2. For player profile mutations: stop sending the full blob to a single
   endpoint. Route each user action to its specific endpoint:
   - Registration form → `POST /players`
   - "Change nick" UI → `PATCH /players/me/nick`
   - Settings page → `PATCH /players/me/preferences`
   - Tutorial dismiss → `PUT /players/me/tutorial-prompts/:modeId`
3. Expect `201` (not `200`) on creation endpoints — adjust client code that
   strict-checks `response.status === 200`.
4. Legacy endpoints stay live during migration; remove the v1 client only
   after every feature has been ported and verified.

## Response DTOs

Unchanged from v1 — see `src/dto/scores.dto.js`, `src/dto/challenges.dto.js`,
`src/dto/words.dto.js`.
