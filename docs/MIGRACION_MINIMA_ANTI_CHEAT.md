# Migración mínima anti-cheat (daily + score sync)

## Objetivo

Reducir el vector de trampa más fácil sin rehacer toda la arquitectura:

1. Evitar persistir la palabra diaria literal en `localStorage`.
2. Dejar de confiar ciegamente en `pointsDelta` enviado por cliente en `syncRoundEvents`.

## No objetivos (en esta migración mínima)

- No buscamos seguridad criptográfica total contra cliente comprometido.
- No se rediseña por completo el sistema offline.
- No se cambia el flujo de UI ni los contratos de vistas más allá de lo necesario.

## Estado actual (resumen)

- Daily:
  - Se cachea `wordle:daily-word:<YYYY-MM-DD>` con la palabra literal.
  - Se cachea `wordle:daily-meaning:<YYYY-MM-DD>:<WORD>` (también filtra la palabra).
- Score sync:
  - El cliente encola eventos y manda `pointsDelta` a backend.
  - Backend suma `pointsDelta` tras deduplicar por `eventId`.

## Estrategia mínima en 2 fases

## Fase 1: Daily por referencia (sin palabra literal persistida)

### Contrato backend `/api/daily` (backward compatible)

Mantener `data.word` temporalmente y añadir referencia:

```json
{
  "ok": true,
  "data": {
    "date": "2026-04-28",
    "gameId": "daily:2026-04-28",
    "seed": 1234567890,
    "meaning": "..."
  }
}
```

Notas:

- `gameId + seed` debe resolver exactamente la palabra diaria usando la misma lógica de `resolveAnswerFromGameReference`.
- `data.word` se mantiene solo para compatibilidad durante la transición.

### Cambios frontend

1. Añadir cache de referencia diaria:
   - Nueva key: `wordle:daily-ref:<YYYY-MM-DD>`.
   - Valor: `{ gameId, seed, date }`.
2. Dejar de persistir `wordle:daily-word:*`.
3. Cambiar meaning key para no incluir palabra:
   - Nueva key: `wordle:daily-meaning:<YYYY-MM-DD>`.
4. Mantener lectura legacy durante transición:
   - Si no existe referencia nueva, usar `daily-word` antiguo solo como fallback.
5. Limpieza:
   - Al guardar referencia del día actual, borrar referencias/meanings anteriores.
   - (ya existe limpieza diaria; extenderla a nuevas keys).

### Compatibilidad y rollout

- Versión N:
  - Lee viejo + nuevo.
  - Escribe nuevo.
- Versión N+1:
  - Solo fallback de lectura vieja.
- Versión N+2:
  - Eliminar lectura vieja.

## Fase 2: `syncRoundEvents` server-authoritative (mínimo viable)

### Problema a resolver

Hoy backend acepta `pointsDelta` de cliente como fuente de verdad.

### Contrato nuevo de evento win (v3)

Mantener v2 temporalmente, añadir v3:

```json
{
  "id": "uuid",
  "kind": "win",
  "modeId": "classic|lightning|daily",
  "happenedAt": 1714330000000,
  "version": 3,
  "proof": {
    "roundStartedAt": 1714329990000,
    "guessesUsed": 4,
    "difficulty": "easy|normal|hard|insane",
    "hardModeEnabled": false,
    "hardModeSecondsLeft": 0,
    "guessWords": ["...", "..."]
  }
}
```

`pointsDelta` pasa a opcional/telemetría (no autoritativo).

### Reglas backend mínimas

Para v3:

1. Ignorar `pointsDelta` como fuente de verdad.
2. Recalcular puntos en backend con reglas equivalentes a frontend.
3. Validaciones duras:
   - `guessesUsed` en rango válido.
   - `roundStartedAt <= happenedAt`.
   - Duración mínima (`MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS`).
4. Reglas de daily:
   - Máximo 1 win de `daily` por perfil por día UTC.
   - Si ya ganó hoy, el evento no suma puntos.
5. Guardar motivo de rechazo (telemetría) para depurar fraude/falsos positivos.

Para v2 (transicional):

- Mantener comportamiento actual, pero con flag de deprecación y observabilidad.

### Telemetría mínima en `scoreEvents`

- Guardar `version` del evento sync procesado.
- Guardar `clientPointsDelta` si vino en payload.
- Guardar `pointsDelta` autoritativo aplicado por backend (incluye `0` en rechazos).
- Guardar `rejectionReason` cuando un `win v3` no aplica score/racha o cuando se bloquea daily duplicado UTC.

## Cambios por capa (mapa concreto)

### Domain

- Extender tipo `RoundSyncEvent` para `version: 3` con `proof`.

### Hooks/Controllers

- En la resolución de victoria, además de puntos UI, construir `proof` y pasarlo al commit.

### Provider

- `commitVictory` debe encolar evento v3 con proof.

### API client

- `ScoreClient.queueRoundEvent` y `syncRoundEvents` deben aceptar/enviar v3.
- Mantener lectura de eventos legacy para no romper colas antiguas.

### Backend Convex

- Extender `roundSyncEventValidator`.
- En `syncRoundEvents`:
  - Branch por versión.
  - Recalcular score para v3.
  - Aplicar dedupe y reglas daily por día UTC.

## Plan de implementación (orden recomendado)

1. Introducir tipos v3 + parser tolerant (sin activar lógica nueva).
2. Implementar daily reference cache (Fase 1).
3. Extender backend para aceptar v3 sin usarlo aún.
4. Activar envío v3 desde frontend.
5. Activar recálculo server-side para v3.
6. Monitorear 3-7 días.
7. Cortar v2 (o dejar solo compat temporal).

## Migración de datos

- No requiere migración destructiva.
- Las entradas legacy de `localStorage` se limpian oportunistamente desde frontend.
- `scoreEvents` históricos v2 siguen válidos; nuevos eventos usarán v3.

## Riesgos y mitigaciones

1. Divergencia de fórmula frontend/backend:
   - Mitigar con tests espejo de scoring en ambos lados.
2. Rechazos falsos por reloj cliente:
   - Aplicar tolerancia razonable en validación temporal.
3. Impacto offline:
   - Mantener cola local y compat v2 durante transición.

## Criterios de aceptación

1. No hay palabra diaria literal persistida en `localStorage`.
2. Daily sigue resolviendo la misma palabra para la fecha UTC.
3. Backend no incrementa score de eventos v3 manipulando `pointsDelta`.
4. Un perfil no puede sumar más de una victoria daily por día UTC.
5. Las pruebas de daily + score sync cubren v2 y v3 durante transición.

