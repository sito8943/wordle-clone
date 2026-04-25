# Operaciones de datos de Convex (Markdown)

## Operaciones CRUD usadas en el backend Convex

- Lectura: `query(...).withIndex(...).collect()`, `query(...).withIndex(...).first()`, `query(...).withIndex(...).unique()`, `query(...).collect()`, `get(id)`.
- Escritura: `insert(...)`, `patch(id, ...)`, `delete(id)`.

## Qué llama el frontend y qué es interno

### Aclaración importante

- El frontend **no** hace `insert/patch/delete/query/get` directo sobre tablas.
- El frontend llama funciones públicas (`scores:*`, `words:*`, `challenges:*`) vía `ConvexGateway`.
- Las operaciones de base de datos (`ctx.db.*`) son **internas del backend Convex** y ocurren dentro de `convex/*.ts`.

### Funciones Convex usadas por frontend (flujo normal)

- `scores:upsertPlayerProfile`
- `scores:getPlayerByCode`
- `scores:getCurrentPlayerProfile`
- `scores:syncRoundEvents`
- `scores:isNickAvailable`
- `scores:listTopScores`
- `words:ensureLanguageSeeded`
- `words:listByLanguage`
- `words:getLanguageChecksum`
- `challenges:getTodayChallenges`
- `challenges:generateDailyChallenges`
- `challenges:getPlayerChallengeProgress`
- `challenges:completeChallenge`

### Funciones Convex usadas desde frontend solo en herramientas de desarrollador

- `scores:updateScore` (vía `recordScore(..., UPDATE_SCORE_MUTATION)` en consola developer)
- `words:refreshLanguageChecksum`
- `challenges:regenerateDailyChallenges`
- `challenges:resetPlayerChallengeProgressForDate`

### Funciones Convex usadas por scripts/manual (no por flujo normal del frontend)

- `scores:backfillPlayerCodes` (script `scripts/backfill-player-codes.mjs`)
- `words:seedLanguageWords` (script `scripts/seed-spanish-words.mjs`)
- `exportData:exportAllData` (script `scripts/export-convex-data.mjs`)

### Funciones expuestas pero sin uso detectado en runtime actual de frontend

- `challenges:listAllChallenges`
- `challenges:seedChallenges` (queda disponible para mantenimiento manual)
- `scores:addScore` (se mantiene para compatibilidad y colas legacy/offline)

## 1) Módulo `scores`

Fuente: [convex/scores.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/convex/scores.ts)

| Función                   | Tipo     | Lecturas                                                                                                                            | Escrituras                                                                                 |
| ------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `addScore`                | mutation | Busca perfil por `clientRecordId`/`clientId`, lee `scores` completo para validar nick                                               | `patch` en `scores` si existe; `insert` en `scores` si no existe                           |
| `updateScore`             | mutation | Igual que `addScore`                                                                                                                | Igual que `addScore` (pero en modo overwrite)                                              |
| `upsertPlayerProfile`     | mutation | Busca perfil por `clientRecordId`/`clientId`, lee `scores` completo para validar nick, verifica unicidad de `playerCode` por índice | `patch` de perfil en `scores` o `insert` de nuevo perfil en `scores`                       |
| `getPlayerByCode`         | query    | Lee `scores` por índice `by_player_code`                                                                                            | Sin escritura                                                                              |
| `getCurrentPlayerProfile` | query    | Lee `scores` por `clientRecordId` o `clientId`                                                                                      | Sin escritura                                                                              |
| `syncRoundEvents`         | mutation | Upsert de perfil (lecturas de `scores`), deduplicación por `scoreEvents.by_event_id`                                                | `insert` en `scoreEvents` por evento nuevo, `patch` en `scores` con score/streak agregados |
| `backfillPlayerCodes`     | mutation | Lee todos los `scores`, verifica códigos por índice `by_player_code`                                                                | `patch` en `scores` para perfiles sin código válido                                        |
| `isNickAvailable`         | query    | Lee todos los `scores`; opcionalmente busca record actual por `by_client_record_id`                                                 | Sin escritura                                                                              |
| `listTopScores`           | query    | Lee todos los `scores`, resuelve perfil actual por id/recordId, consulta `scoreEvents.by_profile_id` para `hasWonDailyToday`        | Sin escritura                                                                              |

## 2) Módulo `challenges`

Fuente: [convex/challenges.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/convex/challenges.ts)

| Función                               | Tipo     | Lecturas                                                                                                                                              | Escrituras                                                                                                                                 |
| ------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `getTodayChallenges`                  | query    | Lee `dailyChallenges` por `by_date`, luego `get` de `challenges` (simple/complex)                                                                     | Sin escritura                                                                                                                              |
| `getPlayerChallengeProgress`          | query    | Lee perfil en `scores.by_client_id`, luego `playerChallengeProgress.by_profile_and_date`                                                              | Sin escritura                                                                                                                              |
| `listAllChallenges`                   | query    | Lee todos los `challenges`                                                                                                                            | Sin escritura                                                                                                                              |
| `generateDailyChallenges`             | mutation | Lee `dailyChallenges.by_date`, catálogo `challenges` y referencias activas para seeding seguro, luego `challenges` disponibles por `by_type_and_used` | `patch`/`insert` de catálogo (seed interno), `patch` `challenges.used`, `delete` daily inválido, `insert` en `dailyChallenges`             |
| `regenerateDailyChallenges`           | mutation | Lee `dailyChallenges.by_date`, catálogo `challenges` y referencias activas para seeding seguro, lee `challenges` previos y disponibles                | `patch`/`insert` de catálogo (seed interno), `patch` `challenges.used`, `delete` daily previo, `insert` nuevo daily                        |
| `completeChallenge`                   | mutation | Lee perfil en `scores`, `get` challenge, valida daily por `dailyChallenges.by_date`, consulta `playerChallengeProgress.by_profile_and_challenge`      | `insert` en `playerChallengeProgress`, `patch` score del perfil en `scores`                                                                |
| `resetPlayerChallengeProgressForDate` | mutation | Lee perfil en `scores`, consulta `playerChallengeProgress.by_profile_and_date`                                                                        | `delete` entradas de progreso, `patch` score revertido en `scores`                                                                         |
| `seedChallenges`                      | mutation | Lee `challenges`, `dailyChallenges`, `playerChallengeProgress`                                                                                        | Sincronización de catálogo: `patch` descripciones/tipos/keys, `insert` faltantes, y `delete` solo de inválidos/duplicados no referenciados |

## 3) Módulo `words`

Fuente: [convex/words.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/convex/words.ts)

| Función                   | Tipo     | Lecturas                                                         | Escrituras                                                                                         |
| ------------------------- | -------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `ensureLanguageSeeded`    | mutation | Lee `words` por `by_language`; vuelve a leer tras seed           | `insert` en `words` si estaba vacío; `patch/insert` en `wordsMeta`                                 |
| `seedLanguageWords`       | mutation | Lee `words` por `by_language`; vuelve a leer tras seed           | Opcional `delete` de `words` existentes, `insert` de nuevas `words`, `patch/insert` en `wordsMeta` |
| `listByLanguage`          | query    | Lee `words` por `by_language`                                    | Sin escritura                                                                                      |
| `getLanguageChecksum`     | query    | Lee `wordsMeta` por `by_language`                                | Sin escritura                                                                                      |
| `refreshLanguageChecksum` | mutation | Lee `words` por `by_language`, lee `wordsMeta` por `by_language` | `patch` o `insert` en `wordsMeta`                                                                  |

## 4) Módulo `exportData`

Fuente: [convex/exportData.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/convex/exportData.ts)

| Función         | Tipo  | Lecturas                                                                                                                          | Escrituras    |
| --------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `exportAllData` | query | `collect()` completo de `scores`, `scoreEvents`, `words`, `wordsMeta`, `challenges`, `dailyChallenges`, `playerChallengeProgress` | Sin escritura |

## Resumen por tabla (qué operaciones recibe)

- `scores`: `query` (collect/first por índices), `insert`, `patch`.
- `scoreEvents`: `query` (first por `by_event_id`, collect por `by_profile_id`), `insert`.
- `words`: `query` (collect por `by_language`), `insert`, `delete`.
- `wordsMeta`: `query` (unique por `by_language`), `insert`, `patch`.
- `challenges`: `query` (collect e indexado por `by_type_and_used`), `get`, `insert`, `patch`, `delete`.
- `dailyChallenges`: `query` (unique por `by_date`), `insert`, `delete`.
- `playerChallengeProgress`: `query` (collect por índices), `insert`, `delete`.
