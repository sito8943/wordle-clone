# Plan: Tablero Generico y Configurable

## Objetivo

Generalizar la forma del tablero/ronda para que el modo actual siga funcionando igual, pero sobre una base configurable.

Restriccion principal:

- El primer entregable debe ser **cero regresiones en el comportamiento clasico** sobre la nueva base.

## Baseline actual (a preservar)

- El tablero esta fijo a `6x5` en constantes de dominio.
- La validacion de intentos y las transiciones de estado dependen de `WORD_LENGTH` y `MAX_GUESSES` fijos.
- El `Board` UI consume filas derivadas desde dominio; no recibe configuracion de tablero.
- Hoy las variantes de juego se aplican por dificultad, no por configuracion real de modo/tablero.

## Estado actual

- [x] Fase 1 completada.
- [x] Fase 2 completada para flujo clasico.
- [x] Fase 3 completada (incluyendo validacion global ejecutada manualmente).
- [~] Fase 4 iniciada (resolver de modo + cableado clasico base).

Notas:

- Ya existe `BoardRoundConfig` y un `CLASSIC_ROUND_CONFIG` como base por defecto.
- `Board`, dominio y hook principal ya aceptan configuracion de ronda.
- El flujo actual sigue cableado a config clasica de forma explicita.
- Se relevaron puntos que siguen acoplados al clasico (`WORD_LENGTH`/`MAX_GUESSES`) fuera del core de board.
- La validacion global de calidad se ejecuto manualmente fuera de esta iteracion.

## Fase 1: Fundacion configurable (sin cambiar comportamiento)

Estado: [x] Hecha

### 1.1 Crear tipos de configuracion en dominio

- Crear un tipo de configuracion de ronda (por ejemplo: `BoardRoundConfig`) con, como minimo:
- `lettersPerRow`
- `maxGuesses`
- Definir `CLASSIC_ROUND_CONFIG = { lettersPerRow: 5, maxGuesses: 6 }`.
- Mantener constantes actuales como alias/fallback durante la migracion.

### 1.2 Parametrizar generacion de filas

- Actualizar `buildBoardRows` para recibir dimensiones desde config.
- Mantener camino por defecto para que los callers actuales se comporten igual.
- Asegurar que la generacion de filas/celdas quede 100% gobernada por config.

### 1.3 Parametrizar transiciones de estado base

- Actualizar helpers (`validateGuessInput`, `applyGuess`, `addLetter`, `setLetterAt`, etc.) para usar la config.
- Preservar comportamiento actual con config clasica por defecto si no se pasa config.

## Fase 2: Cableado de hooks/controladores (clasico por defecto)

Estado: [x] Hecha

### 2.1 Extender options del hook principal

- Agregar config opcional en el tipo de options del hook principal.
- Reemplazar usos directos de `WORD_LENGTH/MAX_GUESSES` por valores resueltos de config.
- Mantener `CLASSIC_ROUND_CONFIG` como default.

### 2.2 Conectar desde `usePlayController`

- Resolver config de ronda para el flujo actual (inicialmente equivalente al clasico).
- Pasar esa config al hook principal de ronda.
- No tocar reglas de score/hints/timer en esta fase.

### 2.3 Mantener `Board` presentacional y agnostico

- No meter logica de modo dentro de `Board`.
- Asegurar que `Board` renderice la estructura de filas/columnas que llegue desde dominio/controlador.

## Fase 3: Cobertura de regresion primero

Estado: [x] Completa

### 3.1 Conservar tests existentes

- Los tests actuales de board/domain/controller deben seguir pasando sin cambios semanticos.
- Pendiente: ejecutar validacion completa para confirmar regresion cero.

### 3.2 Agregar tests de configurabilidad

- Tests de dominio para dimensiones no clasicas (ej. `7x5`, `6x6`) cubriendo:
- generacion de filas
- validacion de longitud de input
- `gameOver` por max intentos configurable
- Tests de hook para verificar que se respetan los limites de config.
- Estado: [x] Cobertura base agregada (dominio + board + hook + controller).

### 3.3 Chequeos de compatibilidad

- Verificar que serializacion de persistencia sigue compatible (salvo versionado explicito).
- Revisar supuestos de share del tablero (`MAX_GUESSES/WORD_LENGTH`) y decidir:
- se mantiene clasico-only de forma explicita, o
- se migra a config de forma segura.
- Estado: [x] Cerrada.

#### 3.3.1 Diagnostico tecnico (completado)

- Persistencia: `wordle:game` sigue serializando `PersistedGameRef` sin `roundConfig`.
- Share fallback de tablero: usa dimensiones fijas en `usePlayController/utils.ts`.
- Hints: `useHintController` calcula fila completa con `WORD_LENGTH` fijo.
- Challenges: condicion `comeback` depende de `MAX_GUESSES` fijo.
- Game Modes copy: valores de traduccion (`rows`, `letters`) siguen leyendo constantes clasicas.

#### 3.3.2 Decision de contrato (cerrada)

- Mantener compatibilidad hacia atras de `wordle:game` sin versionado extra en esta fase.
- Permitir reset de ronda cuando cambie config/modo (ya soportado en hook principal).
- Migrar a `roundConfig` los puntos de UI/tablero (hints + share fallback + copy de modos) antes de habilitar modos no clasicos.
- Mantener scoring/challenges en contrato clasico por defecto hasta definir reglas por modo, pero `comeback` ya acepta `maxGuesses` configurable cuando se provee contexto.

#### 3.3.3 Backlog de cierre (completado)

1. `useHintController`: ahora recibe `roundConfig` y usa `lettersPerRow`.
2. Share fallback (`captureVictoryBoardImageFile`): ahora renderiza canvas con dimensiones dinamicas desde `roundConfig`.
3. `GameModes/constants.ts`: `rows/letters` ahora derivan de `CLASSIC_ROUND_CONFIG`.
4. Challenges (`comeback`): parametrizado por `maxGuesses` de contexto con fallback clasico.
5. Cobertura de regresion agregada para los cambios anteriores.

## Fase 4: Preparar integracion de modos (despues de estabilizar base)

Estado: [~] En progreso

- Introducir un resolver `mode -> config` (classic, lightning, zen, daily).
- Mantener rutas no clasicas como placeholders/feature-gated hasta cerrar reglas.
- Integrar un modo nuevo por vez despues de validar regresion del clasico.

### 4.1 Resolver explicito de modo

- Crear un contrato en dominio para resolver `modeId -> BoardRoundConfig`.
- Definir `classic` como fuente de verdad para defaults.
- Estado: [x] Implementado (`resolveWordleModeId` + `resolveRoundConfigForMode`).

### 4.2 Plomeria de modo en Play

- Resolver modo activo desde ruta/controlador y pasarlo a `useWordle`.
- Evitar que la UI del tablero conozca reglas de modo; solo consume estado procesado.
- Estado: [x] Completada. `Play`/`PlayViewProvider`/`usePlayController` aceptan `modeId`; `/jugar`, `/clasico`, `/zen`, `/relampago` y `/palabra-diaria` ya enrutan al mismo flujo base sin reglas nuevas por modo.

### 4.3 Activacion progresiva de modos

- Arrancar con `classic` conectado al resolver (sin cambios funcionales).
- Dejar `zen`, `lightning` y `daily` feature-gated hasta cerrar sus reglas de score/hints/timer.
- Estado: [ ] Pendiente.

## Definition of Done (alcance de este plan)

- El modo clasico conserva comportamiento y UX actuales.
- La logica de tablero/ronda acepta dimensiones configurables via contratos de dominio + hooks.
- Hay tests de regresion + tests nuevos para comportamiento configurable.
- No hay logica de negocio de modo filtrada en componentes presentacionales de tablero.

## Orden sugerido de implementacion (estricto)

1. Tipo de config en dominio + default clasico.
2. Soporte de config en `buildBoardRows`.
3. Soporte de config en helpers de estado.
4. Plomeria de config en el hook principal de ronda.
5. Cableado clasico-config en `usePlayController`.
6. Tests de regresion + configurabilidad.
7. Recien ahi empezar implementacion de modos extra.

## Siguiente bloque recomendado

1. Definir y aplicar feature gate/placeholder funcional para `zen`, `lightning` y `daily` mientras no existan reglas cerradas de score/hints/timer por modo.
2. Preparar Fase 4.3: habilitar un solo modo nuevo por vez sobre el resolver ya creado.
