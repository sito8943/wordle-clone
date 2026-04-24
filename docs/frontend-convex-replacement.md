# Reemplazo de Convex desde Frontend

Este backend ya expone un modo de compatibilidad para reemplazar Convex sin rehacer toda la capa cliente.

## Base URL

- Local: `http://localhost:8787`
- Prefijo API: `/api`

## Opción recomendada (migración rápida): Compatibilidad Convex

Usa estos endpoints:

- `POST /api/query`
- `POST /api/mutation`

También están disponibles en:

- `POST /api/db/convex/query`
- `POST /api/db/convex/mutation`

### Formato de request

```json
{
  "name": "scores:listTopScores",
  "args": {
    "limit": 10,
    "language": "es",
    "modeId": "daily",
    "clientId": "..."
  }
}
```

Notas:

- `name` también puede enviarse como `path` o `function`.
- `args` es siempre un objeto JSON.

### Adapter mínimo para frontend

```ts
const API_BASE = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

export const query = async (name: string, args: Record<string, unknown> = {}) => {
  const response = await fetch(`${API_BASE}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, args }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

export const mutation = async (name: string, args: Record<string, unknown> = {}) => {
  const response = await fetch(`${API_BASE}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, args }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};
```

## Funciones Convex soportadas (compatibilidad 1:1)

### Query

- `scores:getPlayerByCode`
- `scores:getCurrentPlayerProfile`
- `scores:isNickAvailable`
- `scores:listTopScores`
- `words:listByLanguage`
- `words:getLanguageChecksum`
- `challenges:getTodayChallenges`
- `challenges:getPlayerChallengeProgress`
- `challenges:listAllChallenges`

### Mutation

- `scores:addScore`
- `scores:updateScore`
- `scores:upsertPlayerProfile`
- `scores:syncRoundEvents`
- `scores:backfillPlayerCodes`
- `words:ensureLanguageSeeded`
- `words:seedLanguageWords`
- `words:refreshLanguageChecksum`
- `challenges:seedChallenges`
- `challenges:generateDailyChallenges`
- `challenges:regenerateDailyChallenges`
- `challenges:completeChallenge`
- `challenges:resetPlayerChallengeProgressForDate`

## Qué tiene que llamar el frontend (por módulo)

### Scores

- `upsertPlayerProfile` -> `POST /api/mutation` con `name: "scores:upsertPlayerProfile"`
- `getPlayerByCode` -> `POST /api/query` con `name: "scores:getPlayerByCode"`
- `getCurrentPlayerProfile` -> `POST /api/query` con `name: "scores:getCurrentPlayerProfile"`
- `syncRoundEvents` -> `POST /api/mutation` con `name: "scores:syncRoundEvents"`
- `isNickAvailable` -> `POST /api/query` con `name: "scores:isNickAvailable"`
- `listTopScores` -> `POST /api/query` con `name: "scores:listTopScores"`

### Words

- `ensureLanguageSeeded` -> `POST /api/mutation` con `name: "words:ensureLanguageSeeded"`
- `listByLanguage` -> `POST /api/query` con `name: "words:listByLanguage"`
- `getLanguageChecksum` -> `POST /api/query` con `name: "words:getLanguageChecksum"`

### Challenges

- `seedChallenges` -> `POST /api/mutation` con `name: "challenges:seedChallenges"`
- `getTodayChallenges` -> `POST /api/query` con `name: "challenges:getTodayChallenges"`
- `generateDailyChallenges` -> `POST /api/mutation` con `name: "challenges:generateDailyChallenges"`
- `getPlayerChallengeProgress` -> `POST /api/query` con `name: "challenges:getPlayerChallengeProgress"`
- `completeChallenge` -> `POST /api/mutation` con `name: "challenges:completeChallenge"`

### Dev tools (si las usabas)

- `scores:updateScore`
- `words:refreshLanguageChecksum`
- `challenges:regenerateDailyChallenges`
- `challenges:resetPlayerChallengeProgressForDate`

## Diferencias importantes vs Convex

- `scores:isNickAvailable` devuelve `boolean` en modo compatibilidad.
- `scores:addScore` y `scores:updateScore` devuelven `id` (string) en modo compatibilidad.
- Validaciones inválidas devuelven `4xx` con formato:

```json
{
  "ok": false,
  "error": "..."
}
```

## Opción alternativa: REST directo (sin `name/args`)

Si prefieres no usar compatibilidad Convex, puedes llamar:

- Scores: `/api/db/scores/*`
- Words: `/api/db/words/*`
- Challenges: `/api/db/challenges/*`

Referencia de rutas directas:

- `POST /api/db/scores/upsert-player-profile`
- `GET /api/db/scores/player-by-code`
- `GET /api/db/scores/current-player-profile`
- `POST /api/db/scores/sync-round-events`
- `GET /api/db/scores/is-nick-available`
- `GET /api/db/scores/top`
- `POST /api/db/words/ensure-language-seeded`
- `GET /api/db/words/by-language`
- `GET /api/db/words/language-checksum`
- `POST /api/db/challenges/seed`
- `GET /api/db/challenges/today`
- `POST /api/db/challenges/generate-daily`
- `GET /api/db/challenges/player-progress`
- `POST /api/db/challenges/complete`
