# Plan: Sistema de Retos Diarios

## Resumen

Implementar un sistema de retos diarios donde el jugador puede completar desafíos para ganar puntos extra. Cada día se asignan 2 retos al azar: uno **sencillo** y uno **complejo**, cada tipo con su propia puntuación. Los retos tienen una bandera de "usado" y cuando todos se agotan, se reinician.

---

## 1. Backend (Convex)

### 1.1 Nueva tabla: `challenges`

En `convex/schema.ts`, agregar:

```ts
challenges: defineTable({
  name: v.string(),           // Nombre del reto (ej: "Velocista")
  description: v.string(),    // Descripción (ej: "Gana una ronda en menos de 60 segundos")
  type: v.union(v.literal("simple"), v.literal("complex")),
  used: v.boolean(),          // true = ya fue asignado como reto diario
})
  .index("by_type", ["type"])
  .index("by_type_and_used", ["type", "used"]),
```

### 1.2 Nueva tabla: `dailyChallenges`

Tabla que almacena los retos activos del día:

```ts
dailyChallenges: defineTable({
  date: v.string(),                // Fecha ISO "2026-04-11"
  simpleChallengeId: v.id("challenges"),
  complexChallengeId: v.id("challenges"),
})
  .index("by_date", ["date"]),
```

### 1.3 Nueva tabla: `playerChallengeProgress`

Progreso de cada jugador en los retos:

```ts
playerChallengeProgress: defineTable({
  profileId: v.id("scores"),           // Referencia al jugador
  challengeId: v.id("challenges"),     // Reto en cuestión
  date: v.string(),                    // Fecha del reto
  completed: v.boolean(),
  completedAt: v.optional(v.number()), // Timestamp
  pointsAwarded: v.number(),
})
  .index("by_profile_and_date", ["profileId", "date"])
  .index("by_profile_and_challenge", ["profileId", "challengeId"]),
```

### 1.4 Nuevo archivo: `convex/challenges.ts`

**Queries:**

- `getTodayChallenges(date)`: Obtener los 2 retos del día. Si no existen aún, retornar `null`.
- `getPlayerChallengeProgress(profileId, date)`: Progreso del jugador en los retos del día.
- `listAllChallenges`: Lista todos los retos (admin/debug).

> **Flujo de obtención de retos (global, idempotente):**
>
> Los retos del día son **globales** — todos los jugadores ven los mismos 2.
> El primer jugador que entra al juego en un día nuevo dispara la generación:
>
> 1. El cliente llama a `getTodayChallenges(fechaUTC)`
> 2. Si retorna `null` → llama a `generateDailyChallenges(fechaUTC)`
> 3. `generateDailyChallenges` es **idempotente**: si dos jugadores entran al mismo tiempo, el primero crea los retos y el segundo detecta que ya existen y los retorna sin duplicar.
> 4. Todos los jugadores posteriores ese día reciben los mismos 2 retos ya generados.

**Mutations:**

- `generateDailyChallenges(date)`: 
  1. Verificar si ya existen retos para esa fecha → si sí, retornar los existentes.
  2. Buscar 1 reto `simple` con `used: false` al azar.
  3. Buscar 1 reto `complex` con `used: false` al azar.
  4. Si no hay suficientes de algún tipo → reiniciar **todos** los retos (`used = false`) y volver a buscar.
  5. Marcar ambos como `used: true`.
  6. Insertar en `dailyChallenges`.
  
- `completeChallenge(profileId, challengeId, date)`:
  1. Validar que el reto pertenece al día actual.
  2. Validar que no esté ya completado.
  3. Calcular puntos según tipo (`SIMPLE_CHALLENGE_POINTS` o `COMPLEX_CHALLENGE_POINTS`).
  4. Insertar en `playerChallengeProgress`.
  5. Actualizar el `score` del jugador en `scores`.

- `seedChallenges`: Mutación para poblar la tabla con los retos iniciales (similar a `seedLanguageWords`).

### 1.5 Datos semilla de retos

Crear archivo `convex/data/challenges.ts` con los retos predefinidos. Cantidad par (mínimo 6 de cada tipo = 12 total):

**Retos Sencillos (simple):**
| Nombre | Descripción | Condición |
|--------|-------------|-----------|
| Primer intento | Haz al menos 1 intento en una ronda | >= 1 guess |
| Jugador constante | Completa una ronda (ganar o perder) | gameOver = true |
| Explorador | Usa al menos 3 letras diferentes en tu primer intento | >= 3 letras únicas en guess 1 |
| Tres intentos | Usa al menos 3 intentos en una ronda | >= 3 guesses |
| Vocales primero | Tu primer intento debe contener al menos 2 vocales | >= 2 vocales en guess 1 |
| Persistente | Completa 2 rondas en el mismo día | 2 rondas completadas |

**Retos Complejos (complex):**
| Nombre | Descripción | Condición |
|--------|-------------|-----------|
| Velocista | Gana una ronda en menos de 60 segundos | win + tiempo < 60s |
| Genio | Adivina la palabra en 2 intentos o menos | win + guesses <= 2 |
| Racha imparable | Alcanza una racha de 3 victorias | streak >= 3 |
| Perfeccionista | Gana en el primer intento | win + guesses == 1 |
| Dificultad extrema | Gana una ronda en dificultad "hard" o superior | win + difficulty >= hard |
| Políglota | Gana una ronda en cada idioma (EN y ES) en el mismo día | win en ambos idiomas |

---

## 2. Constantes de Puntuación

En `src/domain/wordle/constants.ts`:

```ts
export const SIMPLE_CHALLENGE_POINTS = 5;
export const COMPLEX_CHALLENGE_POINTS = 15;
```

También crear un archivo `src/domain/challenges/` con:
- `constants.ts` — Puntuaciones y tipos
- `types.ts` — Tipos TypeScript para retos
- `validation.ts` — Lógica para evaluar si un reto fue completado dado el estado de la ronda

---

## 3. Dominio: Evaluación de Retos

### 3.1 `src/domain/challenges/types.ts`

```ts
type ChallengeType = "simple" | "complex";

type Challenge = {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
};

type DailyChallenges = {
  date: string;
  simple: Challenge;
  complex: Challenge;
};

type ChallengeProgress = {
  challengeId: string;
  completed: boolean;
  completedAt?: number;
  pointsAwarded: number;
};
```

### 3.2 `src/domain/challenges/validation.ts`

Cada reto tiene un `conditionKey` (string) que mapea a una función evaluadora:

```ts
type ChallengeConditionContext = {
  guesses: GuessResult[];
  gameOver: boolean;
  won: boolean;
  answer: string;
  difficulty: PlayerDifficulty;
  streak: number;
  roundDurationMs: number;
  language: PlayerLanguage;
  dailyCompletedRounds: number;
  dailyLanguagesWon: Set<string>;
};

// Mapeo conditionKey → función evaluadora
const conditionEvaluators: Record<string, (ctx: ChallengeConditionContext) => boolean>;
```

---

## 4. API Layer

### 4.1 `src/api/challenges/ChallengeClient.ts`

Nuevo cliente que usa `ConvexGateway`:

- `getTodayChallenges()` → `DailyChallenges | null`
- `generateDailyChallenges(date)` → `DailyChallenges`
- `getPlayerProgress(profileId, date)` → `ChallengeProgress[]`
- `completeChallenge(profileId, challengeId, date)` → `{ pointsAwarded: number }`

### 4.2 `src/api/challenges/types.ts`

Tipos para request/response del API.

---

## 5. Hooks

### 5.1 `src/hooks/useDailyChallenges.ts`

Hook global que:
1. Obtiene los retos del día (query a Convex).
2. Si no existen, llama a `generateDailyChallenges`.
3. Retorna `{ challenges, progress, isLoading }`.

### 5.2 Integración en `usePlayController`

Después de `commitVictory` o `commitLoss`, evaluar si algún reto del día fue completado:
1. Construir `ChallengeConditionContext` con datos de la ronda.
2. Evaluar cada reto no completado.
3. Si se completó, llamar a `completeChallenge`.

---

## 6. UI

### 6.1 Componente `DailyChallengesCard`

En `src/views/Play/components/DailyChallenges/`:

- Tarjeta que muestra los 2 retos del día.
- Cada reto muestra: icono de tipo, nombre, descripción, puntos, estado (pendiente/completado).
- Animación cuando se completa un reto.

### 6.2 Ubicación en la vista

Agregar en `src/views/Play/sections/` como una sección debajo del toolbar o como un botón que abre un dialog.

**Opción recomendada:** Botón en el toolbar que abre un `DailyChallengesDialog` (sigue el patrón existente de dialogs lazy-loaded en `DialogsSection`).

### 6.3 Notificación de reto completado

Al completar un reto, mostrar un `Alert` toast con el nombre del reto y los puntos ganados.

---

## 7. i18n

En `src/i18n/resources.ts`, agregar claves para ambos idiomas:

```
challenges.title
challenges.simple
challenges.complex
challenges.completed
challenges.points
challenges.daily_title
challenges.no_challenges
challenges.[nombre_de_cada_reto]
challenges.[descripcion_de_cada_reto]
```

---

## 8. Feature Flag

En `src/config/env.ts`, agregar:

```ts
VITE_FEATURE_DAILY_CHALLENGES: boolean
```

Para poder activar/desactivar el feature.

---

## 9. Orden de Implementación

| Paso | Tarea | Archivos |
|------|-------|----------|
| 1 | Definir constantes y tipos del dominio | `src/domain/challenges/*` |
| 2 | Schema Convex + datos semilla | `convex/schema.ts`, `convex/data/challenges.ts` |
| 3 | Funciones Convex (queries + mutations) | `convex/challenges.ts` |
| 4 | API client | `src/api/challenges/*` |
| 5 | Lógica de validación de retos | `src/domain/challenges/validation.ts` |
| 6 | Hook `useDailyChallenges` | `src/hooks/useDailyChallenges.ts` |
| 7 | Feature flag | `src/config/env.ts` |
| 8 | i18n keys | `src/i18n/resources.ts` |
| 9 | UI: Dialog + Card + integración toolbar | `src/views/Play/components/DailyChallenges/*` |
| 10 | Integración en `usePlayController` | `src/views/Play/hooks/usePlayController/` |
| 11 | Tests | `*.test.ts` junto a cada archivo |

---

## 10. Validaciones Importantes

- **Paridad:** La semilla debe tener cantidad par de retos (N simples + N complejos, donde N >= 1). Validar en `seedChallenges`.
- **Reset atómico:** Cuando se agotan retos de un tipo, reiniciar **todos** (ambos tipos) en una sola transacción.
- **Idempotencia:** `generateDailyChallenges` debe ser idempotente — si ya existen para la fecha, retornar los existentes.
- **Timezone:** Usar UTC para la fecha del día para consistencia global.
- **Anti-trampas:** La evaluación de condiciones debe ocurrir también en el backend (no confiar solo en el cliente).
