# Plan: Sistema de Retos Diarios

## Resumen

Implementar un sistema de retos diarios donde el jugador puede completar desafíos para ganar puntos extra. Cada día se asignan 2 retos al azar: uno **sencillo** y uno **complejo**, cada tipo con su propia puntuación. Los retos tienen una bandera de "usado" y cuando todos se agotan, se reinician.

---

## 1. Backend (Convex) — COMPLETADO

### 1.1 Nueva tabla: `challenges`

En `convex/schema.ts`:

```ts
challenges: defineTable({
  name: v.string(),
  description: v.string(),
  type: v.union(v.literal("simple"), v.literal("complex")),
  conditionKey: v.string(),
  used: v.boolean(),
})
  .index("by_type", ["type"])
  .index("by_type_and_used", ["type", "used"]),
```

### 1.2 Nueva tabla: `dailyChallenges`

```ts
dailyChallenges: defineTable({
  date: v.string(),
  simpleChallengeId: v.id("challenges"),
  complexChallengeId: v.id("challenges"),
}).index("by_date", ["date"]),
```

### 1.3 Nueva tabla: `playerChallengeProgress`

```ts
playerChallengeProgress: defineTable({
  profileId: v.id("scores"),
  challengeId: v.id("challenges"),
  date: v.string(),
  completed: v.boolean(),
  completedAt: v.optional(v.number()),
  pointsAwarded: v.number(),
})
  .index("by_profile_and_date", ["profileId", "date"])
  .index("by_profile_and_challenge", ["profileId", "challengeId"]),
```

### 1.4 Funciones: `convex/challenges.ts`

> **Flujo de obtención de retos (global, idempotente):**
>
> Los retos del día son **globales** — todos los jugadores ven los mismos 2.
> El primer jugador que entra al juego en un día nuevo dispara la generación:
>
> 1. El cliente llama a `getTodayChallenges(fechaUTC)`
> 2. Si retorna `null` → llama a `generateDailyChallenges(fechaUTC)`
> 3. `generateDailyChallenges` es **idempotente**: si dos jugadores entran al mismo tiempo, el primero crea los retos y el segundo detecta que ya existen y los retorna sin duplicar.
> 4. Todos los jugadores posteriores ese día reciben los mismos 2 retos ya generados.

**Queries:**

- `getTodayChallenges(date)` — Obtener los 2 retos del día. Si no existen aún, retorna `null`.
- `getPlayerChallengeProgress(clientId, date)` — Progreso del jugador (resuelve profile internamente via `clientId`).
- `listAllChallenges` — Lista todos los retos (admin/debug).

**Mutations:**

- `generateDailyChallenges(date)` — Genera retos del día (idempotente). Resetea todos si se agotaron.
- `completeChallenge(clientId, challengeId, date)` — Valida, registra progreso, suma puntos al jugador.
- `seedChallenges` — Pobla la tabla con retos iniciales (valida paridad simple/complex).

> **Nota:** Las funciones usan `clientId` (string) en vez de `profileId` (Convex ID). El backend resuelve el perfil internamente via el índice `by_client_id` de la tabla `scores`. Esto evita que el frontend necesite conocer el Convex document ID.

### 1.5 Datos semilla: `convex/data/challenges.ts`

12 retos (6 simples + 6 complejos):

**Retos Sencillos (simple) — 5 pts cada uno:**
| Nombre | conditionKey | Condición |
|--------|-------------|-----------|
| First Guess | `first_guess` | >= 1 guess |
| Steady Player | `complete_round` | gameOver = true |
| Explorer | `unique_letters` | >= 3 letras únicas en guess 1 |
| Three Tries | `three_guesses` | >= 3 guesses |
| Vowels First | `vowels_first` | >= 2 vocales en guess 1 |
| Persistent | `persistent` | 2 rondas completadas en el día |

**Retos Complejos (complex) — 15 pts cada uno:**
| Nombre | conditionKey | Condición |
|--------|-------------|-----------|
| Speedster | `speedster` | win + tiempo < 60s |
| Genius | `genius` | win + guesses <= 2 |
| Unstoppable Streak | `unstoppable_streak` | streak >= 3 |
| Perfectionist | `perfectionist` | win + guesses == 1 |
| Extreme Difficulty | `extreme_difficulty` | win + difficulty >= hard |
| Polyglot | `polyglot` | win en EN y ES en el mismo día |

---

## 2. Dominio — COMPLETADO

### 2.1 `src/domain/challenges/constants.ts`

```ts
SIMPLE_CHALLENGE_POINTS = 5
COMPLEX_CHALLENGE_POINTS = 15
```

### 2.2 `src/domain/challenges/types.ts`

- `ChallengeType` — `"simple" | "complex"`
- `ChallengeConditionKey` — Union de las 12 claves de condición
- `Challenge`, `DailyChallenges`, `ChallengeProgress`
- `ChallengeConditionContext` — Datos de la ronda para evaluar condiciones

### 2.3 `src/domain/challenges/validation.ts`

12 funciones evaluadoras mapeadas por `conditionKey`:
- Simples: `first_guess`, `complete_round`, `unique_letters`, `three_guesses`, `vowels_first`, `persistent`
- Complejos: `speedster`, `genius`, `unstoppable_streak`, `perfectionist`, `extreme_difficulty`, `polyglot`

Exporta: `evaluateCondition(key, context) → boolean`

---

## 3. API Client — COMPLETADO

### 3.1 `src/api/challenges/ChallengeClient.ts`

Usa `ConvexGateway` y lee `clientId` de `localStorage` (`wordle:scoreboard:client-id`):

- `getTodayChallenges(date)` → `RemoteDailyChallenges | null`
- `generateDailyChallenges(date)` → `RemoteDailyChallenges`
- `getPlayerChallengeProgress(date)` → `RemoteChallengeProgress[]`
- `completeChallenge(challengeId, date)` → `CompleteChallengeResult`
- `seedChallenges()` → seed result

### 3.2 `src/api/challenges/types.ts`

- `RemoteChallenge`, `RemoteDailyChallenges`, `RemoteChallengeProgress`, `CompleteChallengeResult`

### 3.3 `src/api/challenges/constants.ts`

Referencias a las funciones Convex (`challenges:getTodayChallenges`, etc.).

### 3.4 Integración en ApiProvider

- `src/providers/Api/ApiProvider.tsx` — Instancia `ChallengeClient` junto a `ScoreClient` y `WordDictionaryClient`
- `src/providers/Api/types.ts` — `challengeClient` agregado a `ApiContextType`
- `src/test/utils.tsx` — Mock de `ChallengeClient` para tests

---

## 4. Feature Flag — COMPLETADO

- `src/config/env.ts` — `dailyChallengesEnabled` (lee `VITE_DAILY_CHALLENGES_ENABLED`, default `true`)
- `src/config/types.ts` — `dailyChallengesEnabled: boolean` en `RuntimeEnv`
- `src/providers/FeatureFlags/types.ts` — Agregado a `FeatureFlags`
- `src/providers/FeatureFlags/utils.ts` — Mapeado desde env

---

## 5. i18n — COMPLETADO

En `src/i18n/resources.ts`, claves EN y ES bajo `challenges.*`:

- `title`, `simple`, `complex`, `completed`, `pending`, `points`
- `noChallengesToday`, `challengeCompleted`
- `buttonAriaLabel`, `buttonLabel`
- `names.[conditionKey]` — Nombre traducido de cada reto
- `descriptions.[conditionKey]` — Descripción traducida de cada reto

---

## 6. Hook — COMPLETADO

### `src/hooks/useDailyChallenges.ts`

- Fetch de retos al montar (seed → get → generate si null)
- Session storage (`wordle:daily-challenges-dialog-seen`) para auto-show una vez por sesión
- Auto-show solo si al menos un reto está incompleto
- Countdown hasta fin del día UTC (actualización cada 60s)
- Retorna: `challenges`, `progress`, `loading`, `showDialog`, `millisUntilEndOfDay`, `openDialog`, `closeDialog`, `refreshProgress`

---

## 7. UI — COMPLETADO

### 7.1 `DailyChallengesDialog`

En `src/views/Play/components/Dialogs/DailyChallengesDialog/`:

- `DailyChallengesDialog.tsx` — Dialog con 2 `ChallengeRow` (simple + complex)
- Cada fila muestra: checkbox (verde si completado), nombre (tachado si completado), badge de tipo (azul/morado), puntos, descripción
- Countdown al final: `HHh MMm` hasta fin del día UTC
- `types.ts`, `constants.ts`, `index.ts`

### 7.2 Toolbar

En `src/views/Play/sections/Toolbar.tsx`:

- Botón con icono `faTrophy` antes del botón de Help
- Feature-flagged: solo aparece si `dailyChallengesEnabled && challenges !== null`
- Label: `challenges.buttonLabel` ("Challenges" / "Retos")

### 7.3 DialogsSection

En `src/views/Play/sections/DialogsSection.tsx`:

- Lazy-loaded: `const DailyChallengesDialog = lazy(...)`
- Visibilidad condicionada (no se muestra si hay resume/end-of-game/checksum dialogs activos)
- Renderizado antes del developer console dialog

### 7.4 PlayViewProvider

En `src/views/Play/providers/`:

- `PlayViewProvider.tsx` — Usa `useDailyChallenges(dailyChallengesEnabled)` y expone `dailyChallenges` + `dailyChallengesEnabled`
- `types.ts` — `DailyChallengesState` type + campos agregados a `PlayViewContextValue`

---

## 8. Validaciones

- **Paridad:** `seedChallenges` valida que haya igual cantidad de simples y complejos.
- **Reset atómico:** Cuando se agotan retos de un tipo, se reinician **todos**.
- **Idempotencia:** `generateDailyChallenges` retorna existentes si ya hay para la fecha.
- **Timezone:** Fecha del día en UTC (`toISOString().slice(0, 10)`).
- **Session storage:** El dialog auto-show solo ocurre una vez por sesión del navegador.

---

## 9. Tests

- TypeScript compila sin errores (`tsc --noEmit`)
- 55 archivos de test, 523 tests pasando sin regresiones
- Mock de `ChallengeClient` agregado a `src/test/utils.tsx`

---

## 10. Pendiente

| Tarea | Descripción |
|-------|-------------|
| Integración en `usePlayController` | Evaluar retos automáticamente al terminar ronda (`commitVictory`/`commitLoss`) y llamar `completeChallenge` |
| Toast de reto completado | Mostrar `Alert` con nombre y puntos al completar un reto |
| Tests de `validation.ts` | Unit tests para las 12 funciones evaluadoras |
| Tests de `DailyChallengesDialog` | Component tests |
| Tests de `useDailyChallenges` | Hook tests |

---

## Archivos creados/modificados

### Nuevos (14 archivos)
| Archivo | Descripción |
|---------|-------------|
| `convex/data/challenges.ts` | Datos semilla de 12 retos |
| `convex/challenges.ts` | Queries y mutations de Convex |
| `src/domain/challenges/types.ts` | Tipos del dominio |
| `src/domain/challenges/constants.ts` | Constantes de puntuación |
| `src/domain/challenges/validation.ts` | 12 evaluadores de condiciones |
| `src/domain/challenges/index.ts` | Re-exports |
| `src/api/challenges/ChallengeClient.ts` | API client |
| `src/api/challenges/types.ts` | Tipos del API |
| `src/api/challenges/constants.ts` | Referencias Convex |
| `src/api/challenges/index.ts` | Re-exports |
| `src/hooks/useDailyChallenges.ts` | Hook de retos diarios |
| `src/views/Play/components/Dialogs/DailyChallengesDialog/DailyChallengesDialog.tsx` | Componente dialog |
| `src/views/Play/components/Dialogs/DailyChallengesDialog/types.ts` | Props del dialog |
| `src/views/Play/components/Dialogs/DailyChallengesDialog/constants.ts` | Title ID |
| `src/views/Play/components/Dialogs/DailyChallengesDialog/index.ts` | Re-exports |

### Modificados (9 archivos)
| Archivo | Cambio |
|---------|--------|
| `convex/schema.ts` | 3 tablas nuevas |
| `src/config/env.ts` | `dailyChallengesEnabled` |
| `src/config/types.ts` | `dailyChallengesEnabled` en `RuntimeEnv` |
| `src/providers/FeatureFlags/types.ts` | `dailyChallengesEnabled` en `FeatureFlags` |
| `src/providers/FeatureFlags/utils.ts` | Mapeo de flag |
| `src/providers/Api/ApiProvider.tsx` | Instancia `ChallengeClient` |
| `src/providers/Api/types.ts` | `challengeClient` en `ApiContextType` |
| `src/i18n/resources.ts` | Claves EN/ES de challenges |
| `src/views/Play/providers/types.ts` | `DailyChallengesState` + campos |
| `src/views/Play/providers/PlayViewProvider.tsx` | Hook + expose |
| `src/views/Play/sections/Toolbar.tsx` | Botón de trofeo |
| `src/views/Play/sections/DialogsSection.tsx` | Lazy-load + render |
| `src/test/utils.tsx` | Mock de `ChallengeClient` |
