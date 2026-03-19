# Storage Anti-Fraud Plan

## Objetivo

Evaluar y definir un plan para evitar que los jugadores puedan inspeccionar o manipular facilmente la informacion persistida en `localStorage` y `sessionStorage`, especialmente durante una partida o al revisar score, streak y pistas.

## Conclusion tecnica corta

- Hashear todo el contenido del storage no resuelve por si solo el problema.
- Un hash sirve para detectar cambios si existe una fuente de verdad externa con la que compararlo.
- Un hash no oculta datos. Si el navegador necesita leer un dato para seguir jugando, ese dato debe existir en claro en algun punto del cliente.
- Si la clave o secreto para verificar o descifrar vive en frontend, un jugador avanzado tambien puede extraerlo.
- Para antifraude real, la fuente de verdad de los datos sensibles debe salir del cliente y pasar a backend, o al menos quedar firmada por backend.

## Inventario actual a revisar

### `sessionStorage`

- `wordle:session-id`
  - Ubicacion: `src/domain/wordle/session.ts`
  - Riesgo: bajo.
  - Uso: identificar la sesion de la pestaña.

### `localStorage`

- `wordle:game`
  - Ubicacion: `src/domain/wordle/storage.ts`
  - Riesgo: alto.
  - Contiene: estado persistido de partida en curso.

- `player`
  - Ubicacion: `src/providers/Player/PlayerProvider.tsx`
  - Riesgo: muy alto.
  - Contiene: `name`, `code`, `score`, `streak`, `difficulty`, `keyboardPreference`.

- `wordle:hint-usage`
  - Riesgo: medio-alto.
  - Impacto: puede permitir alterar limites de pistas.

- `wordle:scoreboard:profile-identity`
  - Riesgo: alto.
  - Impacto: identidad remota adoptada por el navegador.

- Otras claves de cache o UX
  - Diccionario, tema, animaciones, cache de fuentes.
  - Riesgo: bajo.
  - No merece endurecimiento fuerte salvo limpieza o normalizacion.

## Problemas reales que queremos resolver

1. Que un jugador no pueda leer facilmente el estado de partida y sacar ventaja.
2. Que un jugador no pueda editar `score`, `streak`, `hint usage` o identidad local para hacer fraude.
3. Que el frontend no trate como confiables datos que vienen del propio navegador.

## Estrategia recomendada

### Principio 1: separar confidencialidad de integridad

- Si queremos ocultar datos, necesitamos no exponerlos al cliente o exponer solo un derivado inutil.
- Si queremos detectar manipulacion, necesitamos firma o validacion contra backend.

### Principio 2: el cliente no debe ser fuente de verdad para datos sensibles

- `player.score` y `player.streak` no deberian considerarse autoritativos si luego impactan en ranking o progresion.
- `wordle:game` no deberia guardar mas informacion de la necesaria para reanudar.
- `hint usage` y restricciones de modo dificil deberian poder recomputarse o validarse.

### Principio 3: endurecer por niveles

- Nivel 1: minimizar lo que se guarda.
- Nivel 2: ofuscar solo si mejora UX o dificulta inspeccion casual.
- Nivel 3: mover datos sensibles a backend.
- Nivel 4: firmar payloads emitidos por backend para detectar manipulacion.

## Modelo aprobado para sincronizacion offline

- No se sincronizara un `score` final como numero autoritativo generado por el cliente.
- El frontend persistira eventos de victoria y los enviara despues a Convex cuando vuelva la conexion.
- Convex aplicara secuencialmente los eventos recibidos para actualizar `score` y `streak` del jugador hasta dejar el ultimo valor sincronizado.
- El `score` guardado localmente puede seguir existiendo, pero solo como dato de pintura o cache visual.
- Tras una sincronizacion correcta, la cola local de eventos debe limpiarse para no dejar basura ni reintentos duplicados.
- Si la sincronizacion falla, la cola local debe mantenerse en un formato reintentable, pero sin que su contenido se trate como verdad definitiva.
- La ofuscacion de los eventos puede usarse para frenar inspeccion casual, pero no se considerara una medida de seguridad real ni una garantia antifraude.
- Los eventos pendientes deben enviarse a Convex en orden para que el valor final de `score` y `streak` quede consistente.
- El orden de envio se determinara por la fecha del evento.
- La fecha del evento sera el instante exacto en el que el jugador gana y se crea el `VictorySyncEvent`.
- Mientras el usuario siga offline, el frontend hara un calculo provisional de `score` y `streak` para pintar la UI, pero Convex seguira siendo la autoridad final.

## Modelo aprobado para ocultar `answer`

- No se persistira `answer` en claro en ningun storage del navegador.
- Se adoptara un modelo de referencia derivable local en lugar de persistir la palabra final.
- Esa referencia no sera un indice directo simple.
- La referencia derivable se construira a partir de una semilla numerica aleatoria valida para la partida.
- Esa semilla se resolvera con una formula matematica determinista y rapida que produzca un indice valido dentro del rango real del diccionario.
- El frontend aplicara ese calculo para resolver el indice final o la palabra final a partir de la semilla y del diccionario local.
- El frontend derivara `answer` localmente a partir de esa referencia y del diccionario disponible en cliente para seguir funcionando offline.
- Este modelo elimina la exposicion directa del `answer` en storage, pero no se considerara proteccion fuerte frente a ingenieria inversa.

### Recomendacion concreta para `answer`

- Usar una `seed` numerica de 32 bits por partida.
- Guardar esa `seed` en el persistido de partida en lugar de guardar `answer`.
- Complementar la derivacion con un `gameId` estable por partida para evitar que la referencia sea demasiado trivial.
- Resolver el indice final con una mezcla entera rapida y determinista, por ejemplo una funcion del tipo:
  - `index = mix(seed, gameId) % words.length`
- La funcion `mix` debe usar operaciones enteras baratas como `xor`, multiplicaciones enteras y desplazamientos.
- No se recomienda meter criptografia pesada en frontend para este punto porque no aporta seguridad real equivalente al coste de complejidad.
- Tanto `seed` como `gameId` se generaran en frontend al crear la partida.
- La formula de derivacion de `answer` vivira en frontend y no en backend.

### Propuesta exacta para `mix(seed, gameId)`

```ts
const hashGameId = (gameId: string): number => {
  let hash = 2166136261;

  for (let index = 0; index < gameId.length; index += 1) {
    hash ^= gameId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const mix = (seed: number, gameId: string): number => {
  let value = (seed ^ hashGameId(gameId) ^ 0x9e3779b9) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x85ebca6b) >>> 0;
  value ^= value >>> 13;
  value = Math.imul(value, 0xc2b2ae35) >>> 0;
  value ^= value >>> 16;
  return value >>> 0;
};

const resolveWordIndex = (
  seed: number,
  gameId: string,
  wordsLength: number,
): number => {
  if (wordsLength <= 0) {
    return 0;
  }

  return mix(seed, gameId) % wordsLength;
};
```

- `seed` debe normalizarse como `uint32`.
- `gameId` debe ser estable para la partida actual.
- `resolveWordIndex` debe devolver siempre un indice valido entre `0` y `wordsLength - 1`.
- La funcion es suficientemente rapida para ejecutarse en cliente sin coste apreciable.
- La generacion de `seed`, `gameId` y la resolucion del indice pertenecen al runtime del frontend.

## Regla operativa inicial

- El `score` del jugador solo debe poder alterarse a traves del flujo que se ejecuta cuando el jugador gana un tablero.
- Fuera de ese flujo no debe existir ninguna via legitima para subir, bajar o sobrescribir el `score`.
- Cualquier valor de `score` rehidratado desde `localStorage` debe tratarse como cache de conveniencia y no como fuente de verdad.
- Si hay divergencia entre el valor local y el valor derivado del flujo de victoria o del backend, debe prevalecer el valor validado.
- El `answer` debe desaparecer de cualquier payload persistido en storage.
- Como primera medida concreta, vamos a quitar `answer` de `wordle:game` y de `wordle:hint-usage`.
- El frontend debe seguir pudiendo jugar y generar nuevas partidas estando offline.
- Por tanto, el `answer` no se elimina del runtime del frontend: se derivara localmente desde una referencia persistida no explicita en storage, pero debe seguir estando disponible para que la logica local funcione offline.
- Esa derivacion no debe resolverse con un `wordIndex` directo trivial, sino con un calculo rapido y determinista a partir de varios datos de referencia.
- La referencia persistida de partida podra ser la semilla o un valor derivado de ella, pero no la palabra final en claro.
- `seed`, `gameId` y la formula asociada se generan y ejecutan en frontend igual que en cualquier partida creada offline.
- Los valores locales del jugador no deben poder imponerse sobre el valor real de Convex.
- Cuando una partida terminada deba impactar `score`, `streak` u otros valores reales del jugador, la actualizacion debe ejecutarse a traves de los metodos especificos de negocio y despues el frontend debe refrescarse con el estado confirmado por Convex.
- Cuando el jugador este offline, lo que se acumula para sincronizar no es un numero final de `score`, sino una cola de eventos de victoria.
- Cada evento de victoria llevara ya el `score` actualizado y el `streak` actualizado que el frontend haya calculado provisionalmente.
- No hace falta introducir una logica nueva de calculo para esos dos valores: el evento reutilizara el `score` y el `streak` que el frontend ya calcula hoy.
- Cuando Convex devuelva el estado final confirmado, el frontend debe invalidar la query correspondiente en React Query para rehidratar los datos reales.

## Decision propuesta por clave

### `wordle:game`

- No confiar en hashing como proteccion principal.
- Revisar si el payload actual contiene informacion que el usuario no deberia poder ver.
- Reducir el payload al minimo necesario para reanudar.
- Quitar `answer` del payload persistido.
- Mantener una referencia derivable local para que el frontend siga resolviendo la partida offline y pueda generar partidas nuevas sin conexion.
- Guardar solo la semilla o el valor derivado necesario para recomponer `answer`, nunca la palabra final en claro.
- Si la respuesta o datos criticos estan en el payload, moverlos fuera del cliente o sustituirlos por un identificador opaco resuelto por backend.

### Contrato propuesto para `wordle:game-ref`

```ts
type PersistedGameRef = {
  sessionId: string;
  gameId: string;
  seed: number;
  guesses: {
    word: string;
    statuses: ("correct" | "present" | "absent")[];
  }[];
  current: string;
  gameOver: boolean;
};
```

- `sessionId`: mantiene el comportamiento actual de resume entre sesiones o pestañas.
- `gameId`: identifica de forma estable la partida y participa en la derivacion del indice.
- `seed`: entero `uint32` que alimenta la formula de derivacion.
- `guesses`: conserva el historial visual y de juego.
- `current`: conserva la fila en curso.
- `gameOver`: conserva el estado de cierre.
- `answer` no forma parte del contrato persistido.
- `seed` y `gameId` nacen en frontend al crear la partida.

### `player`

- No permitir que `score` y `streak` dependan del valor local como fuente de verdad.
- Mantener en local solo una copia de conveniencia para UX.
- Rehidratar esos campos desde backend al arrancar o al volver online.
- Si sigue existiendo el payload local, tratarlo como cache no confiable.
- Restringir la mutacion de `score` a una unica ruta de negocio: la que se dispara cuando una partida se gana validamente.
- Garantizar que los valores persistidos localmente nunca puedan sobrescribir el valor real confirmado en Convex.
- Tras una actualizacion real de `score`, `streak` o equivalentes, refrescar el estado del frontend con el valor sincronizado desde Convex.
- Si existe `score` en storage, solo se usara para pintar mientras no llegue la respuesta sincronizada de Convex.
- El refresco definitivo del estado debe apoyarse en invalidacion de query en React Query tras la respuesta correcta de Convex.

### `wordle:sync-events`

- Crear una cola local de eventos de victoria para uso offline.
- La cola debe ser la fuente de sincronizacion con Convex, no un `score` final arbitrario.
- Cada evento representa una victoria valida del jugador.
- Los eventos deben enviarse a Convex ordenados por `wonAt`.
- Tras sincronizar correctamente, la cola debe vaciarse o depurarse para que no queden eventos ya aplicados.
- Si los eventos se ofuscan, esa ofuscacion se tratara solo como barrera de bajo nivel.
- Mientras no haya conexion, el frontend puede usar esos eventos para calcular un estado provisional visible.
- Convex no necesita recalcular la victoria desde datos de partida: solo aplicar secuencialmente los valores ya incluidos en cada evento.
- El controlador o hook responsable de esta cola debe exponer un metodo explicito de limpieza.
- Ese metodo de limpieza debe dispararse cuando el frontend confirme que todos los eventos pendientes han sido sincronizados correctamente con backend.

### Contrato recomendado para `wordle:sync-events`

```ts
type VictorySyncEvent = {
  id: string;
  playerId: string;
  score: number;
  streak: number;
  wonAt: number;
  version: 1;
};
```

- `id`: necesario para deduplicar eventos.
- `playerId`: necesario para asociar el evento al jugador correcto.
- `score`: valor acumulado actualizado que debe quedar aplicado tras ese evento.
- `streak`: valor acumulado actualizado que debe quedar aplicado tras ese evento.
- `wonAt`: necesario para ordenar la cola de eventos; se fija en el momento exacto en que se crea el evento al ganar la partida.
- `version`: necesario para poder evolucionar el contrato sin romper compatibilidad.
- `score` y `streak` salen del calculo ya existente en frontend y se copian al evento en el momento de la victoria.

### Campos que no deben viajar en el evento

- `answer`
- payloads grandes de intentos o guesses
- `seed`
- `gameId`
- `difficulty`
- `attemptsUsed`

### `wordle:hint-usage`

- Evaluar moverlo a backend si afecta reglas del juego.
- Quitar `answer` del snapshot persistido.
- Si se mantiene en local, debe poder invalidarse o recomputarse desde un estado confiable.
- El comportamiento funcional de `hint usage` se mantiene igual.
- La unica diferencia es que el persistido ya no guardara `answer`.
- `answer` seguira existiendo en memoria durante la partida para que los hooks o controladores que calculan hints puedan seguir basandose en el.

### `wordle:scoreboard:profile-identity`

- Mantener solo el identificador minimo.
- Validar en backend cualquier operacion sensible asociada a esa identidad.

### Claves de UX

- No invertir tiempo en hashearlas.
- Mantenerlas legibles o en su forma actual.

## Plan por fases

## Fase 0: Auditoria exacta del payload

### Objetivo

Listar con precision que campos se persisten hoy y cuales son sensibles, manipulables o innecesarios.

### Estado

- Auditoria completada en `docs/STORAGE_PHASE0_AUDIT.md`.
- Fase 0 cerrada.

### Tareas

- Revisar `src/domain/wordle/storage.ts`.
- Revisar `src/providers/Player/PlayerProvider.tsx`.
- Revisar persistencia de pistas y scoreboard.
- Documentar por clave:
  - contenido
  - propietario
  - impacto si se lee
  - impacto si se modifica
  - si puede recalcularse

### Entregable

- Tabla de claves con clasificacion `bajo`, `medio`, `alto`, `muy alto`.

## Fase 1: Reducir superficie local

### Objetivo

Guardar menos datos sensibles en navegador.

### Tareas

- Reducir `wordle:game` al minimo imprescindible para reanudar.
- Eliminar del payload cualquier dato derivable.
- Quitar `answer` de `wordle:game`.
- Quitar `answer` de `wordle:hint-usage`.
- Definir la referencia derivable que permitira al frontend seguir resolviendo la partida offline sin dejar `answer` expuesto en storage.
- Definir una semilla numerica valida para la partida y su formula rapida en cliente para derivar `answer` sin usar un indice directo trivial.
- Garantizar que el frontend puede seguir generando nuevas partidas estando offline.
- Revisar si `player.score` y `player.streak` pueden dejar de persistirse como autoridad local.
- Restringir las escrituras de `player.score` para que solo puedan originarse en el flujo de victoria del tablero.
- Introducir una cola local de eventos de victoria para sincronizacion offline.
- Adoptar un contrato minimo de `VictorySyncEvent` con `playerId`, `score`, `streak`, `wonAt` e `id`.
- Hacer que los eventos de victoria sean el unico payload sincronizable hacia Convex para aplicar secuencialmente `score` y `streak`.
- Encauzar cualquier cambio real de `score` y `streak` por los metodos especificos de negocio y por la aplicacion secuencial de la cola de eventos en Convex.
- Limpiar la cola local tras una sincronizacion correcta para no dejar basura ni duplicados.
- Reutilizar el calculo actual de `score` y `streak` del frontend para rellenar los eventos y para pintar el estado provisional mientras no haya conexion.
- Ordenar la cola local y el envio remoto usando `wonAt`.
- Mantener solo ids, flags de UX y cache no sensible cuando sea posible.

### Criterios de aceptacion

- Menos campos sensibles quedan visibles en DevTools.
- La aplicacion sigue pudiendo reanudar una partida y restaurar UX basica.
- No existe ningun flujo alternativo que modifique `score` fuera del evento de victoria.
- `answer` ya no aparece persistido ni en `wordle:game` ni en `wordle:hint-usage`.
- El frontend puede seguir generando partidas nuevas en modo offline.
- Tras una sincronizacion con Convex, el frontend adopta los valores reales confirmados y no los valores adulterados del storage local.
- Convex aplica secuencialmente los eventos de victoria recibidos, no un `score` suelto fuera de evento.
- La cola local de eventos se limpia tras una sincronizacion correcta.
- La partida solo persiste semilla o referencia derivada, no `answer` en claro.
- Los eventos se sincronizan en orden y el frontend corrige cualquier desvio provisional con el valor final devuelto por Convex.
- El orden cronologico de sincronizacion queda definido por `wonAt`, fijado al crear el evento de victoria.

## Fase 2: Definir modelo antifraude real

### Objetivo

Elegir entre ofuscacion ligera o validacion fuerte.

### Opcion A: ofuscacion ligera

- Serializar payload y transformarlo antes de guardarlo.
- Valor: frena inspeccion casual.
- Limite: no evita fraude serio.

### Opcion B: firma de integridad con backend

- Backend emite payload firmado o checksum con secreto servidor.
- Frontend solo envia y recibe blobs o payload + firma.
- Valor: detecta manipulacion.
- Limite: requiere conectividad y cambios de contrato.

### Opcion C: estado sensible remoto

- Backend guarda la verdad de partida, score, streak y limites.
- Cliente conserva solo un `sessionId` o `gameId`.
- Valor: es la opcion mas robusta.
- Limite: mas trabajo y posible dependencia online.

### Recomendacion

- Para score y streak: adoptar el modelo de sincronizacion por eventos de victoria con recalculo autoritativo en Convex.
- Para identidad: mantener Convex como fuente de verdad.
- Para partida en curso y generacion offline: adoptar una variante local basada en referencia derivable que oculte `answer` en storage y permita reconstruirlo en runtime sin depender de backend en cada jugada.
- Para caches de UX: sin cambios.

## Fase 3: Contrato tecnico objetivo

### Objetivo

Dejar definido que leeria y escribiria el frontend despues del endurecimiento.

### Contrato objetivo minimo

- `sessionStorage`
  - `wordle:session-id`

- `localStorage`
  - `player`: solo datos de presentacion y un identificador estable; `score` local, si existe, sera solo visual.
  - `wordle:game-ref`: `{ sessionId, gameId, seed, guesses, current, gameOver }`.
  - `wordle:sync-events`: cola local de eventos de victoria pendiente de sincronizar.
  - claves de UX y cache no sensible.

### Campos a sacar de autoridad local

- `score`
- `streak`
- `hint usage` si afecta reglas
- cualquier dato que revele la respuesta o un estado interno sensible de la partida

## Fase 4: Cambios previstos por capa

### Dominio

- `src/domain/wordle/storage.ts`
  - Adaptar lectura/escritura del estado de partida.
- `src/domain/wordle/session.ts`
  - Mantener `session-id` si sigue siendo util como referencia local.

### Providers y hooks

- `src/providers/Player/PlayerProvider.tsx`
  - Tratar `player` local como cache no confiable.
  - Rehidratar score y streak desde backend.
  - Asegurar que los valores locales nunca sobreescriben los valores reales de Convex.
  - Refrescar el player local despues de cada sincronizacion correcta.
  - Invalidar la query relevante en React Query cuando Convex confirme el estado final.
- `src/hooks/useWordle/*`
  - Ajustar la reanudacion de partida al nuevo contrato.
  - Mantener soporte para jugar y generar partidas nuevas offline.
- `src/views/Home/hooks/useHomeController/*`
  - Ajustar orquestacion de pistas, timeout y refresh.
  - Encadenar la actualizacion del frontend al resultado confirmado de los metodos de negocio cuando una partida impacte al jugador.
  - Encolar eventos de victoria cuando la partida termine offline.
  - Calcular un estado provisional visible mientras Convex no haya confirmado el estado real.
  - Invocar el metodo de limpieza del controlador de eventos tras una sincronizacion correcta.

### API / backend

- `src/api/score/*`
  - Evitar que el cliente imponga score final sin validacion.
  - Tratar Convex como fuente de verdad final para score, streak y demas valores reales del jugador.
  - Exponer una operacion de sincronizacion basada en eventos de victoria pendientes.
- `convex/*`
  - Recibir los eventos pendientes en orden.
  - Aplicar secuencialmente `score` y `streak` desde la cola de eventos recibida.
  - Devolver el estado final confirmado del jugador para refrescar el frontend.

## Fase 5: Prueba controlada

### Objetivo

Validar que el nuevo enfoque mejora antifraude sin romper UX.

### Casos a probar

1. El jugador recarga y reanuda partida sin perder progreso.
2. Manipular `player.score` en DevTools no altera el score efectivo.
3. Manipular `hint usage` no concede pistas extra si la regla debe ser estricta.
4. Inspeccionar `wordle:game` no revela informacion sensible adicional.
5. Recuperar perfil y cambiar de navegador sigue funcionando.
6. El `answer` se recompone a partir de la semilla y no aparece en claro en storage.
7. Jugar offline acumula eventos de victoria sincronizables sin enviar un `score` final arbitrario.
8. Tras sincronizar, Convex devuelve `score` y `streak` recalculados y la cola local queda limpia.
9. Si el frontend calculo un valor provisional distinto, se corrige con el valor final de Convex.
10. Tras la confirmacion de Convex, React Query invalida la query correspondiente y la UI se rehidrata con el estado real.

## Fase 6: Tests y documentacion

### Objetivo

Blindar el nuevo contrato.

### Tareas

- Actualizar tests de:
  - `src/domain/wordle/storage.test.ts`
  - `src/providers/Player/PlayerProvider.test.tsx`
  - `src/hooks/useWordle/useWordle.test.tsx`
  - `src/App.test.tsx`
- Actualizar `ARCHITECTURE.md` si cambia el contrato de persistencia.
- Actualizar `README.md` para documentar el nuevo modelo de persistencia offline, la derivacion de `answer` y la sincronizacion por eventos de victoria.

## Riesgos y limites

- Si el juego debe funcionar completamente offline, no existe antifraude fuerte solo con frontend.
- La ofuscacion puede reducir fraude casual, pero no protege frente a inspeccion intencionada.
- Si el backend pasa a ser fuente de verdad, habra que decidir politicas de reintento, modo offline y recuperacion de sesion.

## Recomendacion final para revisar

- No ejecutar una fase de "hashear todo" como solucion final.
- Hacer primero la Fase 0 y la Fase 1 para ver que podemos sacar del storage.
- Si el objetivo es antifraude real, aprobar una segunda iteracion con backend como fuente de verdad para score, streak y, si hace falta, partida en curso.

## Preguntas a cerrar antes de implementar

1. La partida debe seguir pudiendo reanudarse offline al 100% o aceptamos depender de backend para antifraude fuerte.
2. Que datos consideramos realmente sensibles: solo score y resultados, o tambien la respuesta de la partida.
3. Queremos frenar inspeccion casual o bloquear fraude serio.
