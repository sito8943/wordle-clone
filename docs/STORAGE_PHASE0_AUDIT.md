# Storage Phase 0 Audit

## Objetivo

Inventariar exactamente que se guarda hoy en `localStorage` y `sessionStorage`, clasificar el riesgo de cada clave y decidir si ese dato deberia seguir en cliente, reducirse o moverse a backend.

## Resumen ejecutivo

- El hallazgo mas critico es `wordle:game`: guarda `answer` en claro en el navegador.
- El segundo hallazgo critico es `player`: el cliente persiste `score`, `streak` y `code` en un payload que hoy sigue siendo tratable como verdad local en varios flujos.
- Tambien son sensibles `wordle:hint-usage`, `wordle:scoreboard:cache`, `wordle:scoreboard:pending` y `wordle:scoreboard:profile-identity`, porque permiten inspeccion o manipulacion del progreso y de la identidad local adoptada.
- Las claves de tema, animaciones, fuentes y marcadores visuales de sesion no son un problema de fraude.

## Estado

- Fase 0 cerrada.
- Inventario completado.
- Riesgos clasificados.
- Direccion tecnica inicial aprobada y transferida a Fase 1.

## Tabla de auditoria

| Storage          | Clave                                  | Ubicacion principal                                            | Payload actual                                                                          | Riesgo   | Si se lee                                           | Si se modifica                                                                    | Se puede recalcular                                             |
| ---------------- | -------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- | --------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `sessionStorage` | `wordle:session-id`                    | `src/domain/wordle/session.ts`                                 | `string` UUID/id aleatorio                                                              | Bajo     | Solo identifica la sesion de pestaña                | Puede forzar comportamientos de resume vinculados a otra sesion                   | No exactamente, pero puede regenerarse                          |
| `sessionStorage` | `wordle:start-animation-session-seen`  | `src/hooks/useWordle/utils.ts`                                 | `"seen"`                                                                                | Bajo     | Sin valor sensible                                  | Solo afecta animacion de entrada                                                  | Si                                                              |
| `sessionStorage` | `wordle:keyboard-entry-animation-seen` | `src/hooks/useWordle/utils.ts`                                 | `"seen"`                                                                                | Bajo     | Sin valor sensible                                  | Solo afecta animacion de teclado                                                  | Si                                                              |
| `localStorage`   | `wordle:game`                          | `src/domain/wordle/storage.ts`                                 | `{ sessionId, answer, guesses, current, gameOver }`                                     | Muy alto | Revela la respuesta y el estado completo de partida | Permite alterar progreso, finalizacion y reanudar con estado falso                | Parcialmente                                                    |
| `localStorage`   | `player`                               | `src/providers/Player/PlayerProvider.tsx`                      | `{ name, code, score, streak, difficulty, keyboardPreference }`                         | Muy alto | Expone score, racha y codigo de recuperacion        | Permite fraude local sobre score/racha y manipular preferencias ligadas al perfil | Parcialmente                                                    |
| `localStorage`   | `wordle:hint-usage`                    | `src/views/Home/hooks/useHintController/utils.ts`              | `{ answer, hintsUsed }`                                                                 | Alto     | Expone relacion con la respuesta actual             | Permite dar o quitar pistas segun payload                                         | Si, si la regla se mueve a backend o se deriva de estado fiable |
| `localStorage`   | `wordle:scoreboard:profile-identity`   | `src/api/score/ScoreClient.ts`                                 | `{ clientRecordId }`                                                                    | Alto     | Expone identidad tecnica localmente adoptada        | Permite intentar suplantar el registro remoto asociado                            | No desde frontend puro                                          |
| `localStorage`   | `wordle:scoreboard:client-id`          | `src/api/score/ScoreClient.ts`                                 | `string` id cliente persistente                                                         | Medio    | Expone el id del navegador                          | Permite alterar deduplicacion y ranking local del cliente actual                  | Se puede regenerar, con impacto de identidad local              |
| `localStorage`   | `wordle:scoreboard:cache`              | `src/api/score/ScoreClient.ts`                                 | `StoredScore[]` con `{ localId, clientId?, nick, score, streak, createdAt, mutation? }` | Alto     | Expone ranking cacheado y datos de score            | Permite inyectar score falso en vistas locales u offline                          | Si, desde backend o volviendo a sincronizar                     |
| `localStorage`   | `wordle:scoreboard:pending`            | `src/api/score/ScoreClient.ts`                                 | `StoredScore[]` con cola pendiente                                                      | Alto     | Expone operaciones de score pendientes              | Permite preparar payloads falsos para sincronizacion posterior                    | Si, si backend valida todo                                      |
| `localStorage`   | `wordle:dictionary:en`                 | `src/utils/words.ts`                                           | `string[]` con palabras                                                                 | Medio    | Expone el diccionario local cacheado                | No altera score directamente, pero puede ayudar a exploracion del juego           | Si                                                              |
| `localStorage`   | `wordle:theme-preference`              | `src/hooks/useThemePreference/useThemePreference.ts`           | `"system" \| "light" \| "dark"`                                                         | Bajo     | Sin valor sensible                                  | Solo afecta UX                                                                    | Si                                                              |
| `localStorage`   | `wordle:disable-start-animations`      | `src/hooks/useAnimationsPreference/useAnimationsPreference.ts` | `boolean`                                                                               | Bajo     | Sin valor sensible                                  | Solo afecta UX                                                                    | Si                                                              |
| `localStorage`   | `wordle:fonts:cache-warmed:v1`         | `src/utils/loadFontsAsync.ts`                                  | `"1"`                                                                                   | Bajo     | Sin valor sensible                                  | Solo afecta calentamiento de cache                                                | Si                                                              |

## Payloads exactos sensibles

### `wordle:game`

Fuente: `src/domain/wordle/types.ts`

```ts
type PersistedGameState = {
  sessionId: string;
  answer: string;
  guesses: { word: string; statuses: ("correct" | "present" | "absent")[] }[];
  current: string;
  gameOver: boolean;
};
```

Hallazgos:

- `answer` se persiste en claro.
- `guesses` y `current` permiten reconstruir por completo el estado de la partida.
- `gameOver` puede alterarse manualmente.
- `sessionId` participa en la decision de ofrecer resume entre pestañas.

Impacto:

- Cualquier jugador con DevTools puede ver la respuesta directamente.
- Tambien puede simular estados parciales o finales cambiando el JSON.

### `player`

Fuente: `src/domain/wordle/player.ts` y `src/providers/Player/PlayerProvider.tsx`

```ts
type Player = {
  name: string;
  code: string;
  score: number;
  streak: number;
  difficulty: "easy" | "normal" | "hard" | "insane";
  keyboardPreference: "onscreen" | "native";
};
```

Hallazgos:

- `score` y `streak` viven en local y se incrementan desde cliente.
- `code` queda visible en claro en storage.
- El provider rehidrata directamente desde `useLocalStorage("player", DEFAULT_PLAYER)`.

Impacto:

- Manipular `score` y `streak` localmente puede contaminar UX y ciertos flujos de sincronizacion.
- El codigo de recuperacion queda accesible desde DevTools.

### `wordle:hint-usage`

Fuente: `src/views/Home/hooks/useHintController/types.ts`

```ts
type HintUsageSnapshot = {
  answer: string;
  hintsUsed: number;
};
```

Hallazgos:

- La clave incluye `answer`, otra vez en claro.
- `hintsUsed` puede resetearse o alterarse manualmente.

Impacto:

- Un jugador puede ver la respuesta asociada a la snapshot.
- Un jugador puede intentar desbloquear mas pistas modificando `hintsUsed`.

### `wordle:scoreboard:*`

Fuente: `src/api/score/types.ts` y `src/api/score/ScoreClient.ts`

Payload principal:

```ts
type StoredScore = {
  localId: string;
  clientId?: string;
  nick: string;
  score: number;
  streak: number;
  createdAt: number;
  mutation?: string;
};
```

Hallazgos:

- `cache` y `pending` exponen score, racha, nick e ids tecnicos.
- `profile-identity` guarda `{ clientRecordId }`.
- `client-id` fija una identidad persistente del navegador.
- En offline o con fallo de red, el cliente puede convivir con ranking local y cola pendiente.

Impacto:

- Es facil inyectar scores locales falsos para afectar vistas locales.
- Si backend no valida lo suficiente, una cola manipulada podria intentar sincronizar datos fraudulentos.

## Clasificacion por severidad

### Muy alto

- `wordle:game`
- `player`

### Alto

- `wordle:hint-usage`
- `wordle:scoreboard:profile-identity`
- `wordle:scoreboard:cache`
- `wordle:scoreboard:pending`

### Medio

- `wordle:scoreboard:client-id`
- `wordle:dictionary:en`

### Bajo

- `wordle:session-id`
- claves de tema, animaciones, fuentes y marcadores de sesion visuales

## Datos que no deberian seguir siendo autoridad local

- `wordle:game.answer`
- `player.score`
- `player.streak`
- `wordle:hint-usage.hintsUsed` si las pistas son una regla estricta
- cualquier cola local que luego pueda terminar imponiendo score real sin verificacion fuerte

## Datos que pueden quedarse en cliente sin mucho problema

- preferencia de tema
- preferencia de animaciones
- flags de animaciones ya vistas en la sesion
- cache de fuentes

## Recalculabilidad

### Se puede recalcular facilmente

- tema
- animaciones
- flags visuales de sesion
- cache de diccionario

### Se puede recalcular, pero con soporte remoto o cambio de arquitectura

- score real
- streak real
- estado exacto de hint usage
- estado de scoreboard cache y pending

### No deberia recalcularse solo en cliente

- identidad remota adoptada (`clientRecordId`) si queremos mantener continuidad con backend

## Recomendaciones inmediatas de Fase 0

1. Sacar `answer` de cualquier payload persistido localmente. Ahora mismo aparece en `wordle:game` y `wordle:hint-usage`.
2. Como primera medida aprobada, quitar `answer` de `wordle:game` y de `wordle:hint-usage`.
3. Restringir la mutacion de `player.score` a un unico flujo de negocio: cuando el jugador gana validamente un tablero.
4. Dejar de tratar `player.score` y `player.streak` como autoridad local.
5. Revisar si `wordle:scoreboard:pending` puede seguir existiendo sin firma o validacion fuerte en backend.
6. Mantener sin cambios las claves de UX de riesgo bajo.
7. En la siguiente iteracion, decidir si la partida en curso sera:
   - remota con `gameId`
   - local minimizada sin `answer`
   - o payload firmado por backend

## Decisiones aprobadas

- Quitar `answer` de `wordle:game`.
- Quitar `answer` de `wordle:hint-usage`.
- El frontend debe seguir funcionando offline y poder generar nuevas partidas offline.
- El `answer` puede seguir existiendo en runtime del frontend, pero no debe quedar expuesto en storage persistido.
- El modelo elegido para `answer` es una referencia derivable local, no la palabra en claro.
- Esa referencia derivable no sera un indice directo trivial, sino una semilla numerica o un valor derivado de ella resuelto con una formula rapida y determinista.
- `score` local deja de ser autoridad de negocio y pasa a ser, como maximo, un dato visual o cache de conveniencia.
- `score` solo puede alterarse a traves del flujo de victoria valido.
- La sincronizacion con Convex no se hara enviando un `score` final arbitrario.
- El frontend almacenara una cola local de eventos de victoria para sincronizacion offline.
- Convex aplicara secuencialmente `score` y `streak` a partir de esos eventos.
- Los eventos sincronizados hacia Convex iran en orden segun `wonAt`.
- Tras sincronizar correctamente, la cola local de eventos debe limpiarse.
- El controlador o hook que gestione la cola debe exponer un metodo de limpieza y ejecutarlo tras una sincronizacion correcta.
- Mientras no haya conexion, el frontend podra calcular un valor provisional para pintar.
- `score` y `streak` no requieren un calculo nuevo para este flujo: se reutilizan los valores que el frontend ya calcula hoy y se copian al evento de victoria.
- Tras la respuesta final de Convex, el frontend debe invalidar la query correspondiente en React Query para rehidratar el estado confirmado.
- `hint usage` mantiene su comportamiento actual; solo se elimina `answer` del persistido y el calculo de pistas seguira usando `answer` en memoria.
- `seed`, `gameId` y la formula de derivacion de `answer` se generan y ejecutan en frontend, no en backend.
- La ofuscacion de payloads o eventos se considera una barrera casual, no una garantia antifraude real.
- Convex queda como fuente de verdad final para `score`, `streak` y demas valores reales del jugador.

## Pendientes que pasan a Fase 1

- Definir exactamente la estructura de la semilla numerica de partida y la formula rapida que la convierte en un indice valido del diccionario.
- Decidir la forma final del nuevo persistido de partida sin `answer`.
- Definir el contrato exacto de `wordle:sync-events`.
- Confirmar el identificador exacto que usara `playerId` y el shape final minimo del evento con `score`, `streak` y `wonAt`.
- Definir la estrategia de depuracion y limpieza de eventos ya sincronizados.
- Ajustar el `player` local para que `score` y `streak` sean solo visuales o cacheados sin autoridad.
- Definir el refresh del frontend despues de cada sincronizacion correcta con Convex y como se corrige el calculo provisional local.
- Actualizar tests y contratos de persistencia cuando empiece la implementacion.
- Actualizar `README.md` y la documentacion tecnica asociada cuando el nuevo modelo quede implementado.

## Archivos auditados

- `src/domain/wordle/session.ts`
- `src/domain/wordle/storage.ts`
- `src/domain/wordle/types.ts`
- `src/domain/wordle/state.ts`
- `src/providers/Player/PlayerProvider.tsx`
- `src/domain/wordle/player.ts`
- `src/views/Home/hooks/useHintController/utils.ts`
- `src/views/Home/hooks/useHintController/types.ts`
- `src/api/score/ScoreClient.ts`
- `src/api/score/types.ts`
- `src/api/score/constants.ts`
- `src/hooks/useThemePreference/useThemePreference.ts`
- `src/hooks/useAnimationsPreference/useAnimationsPreference.ts`
- `src/utils/loadFontsAsync.ts`
- `src/hooks/useWordle/utils.ts`

## Siguiente paso propuesto

Ejecutar la Fase 1 sobre tres frentes concretos:

1. Rediseñar `wordle:game` para que no persista `answer`.
2. Introducir la cola `wordle:sync-events` para sincronizacion offline por eventos de victoria.
3. Redefinir `player` para que `score` y `streak` sean cache local no autoritativa o directamente no persistan como verdad.
