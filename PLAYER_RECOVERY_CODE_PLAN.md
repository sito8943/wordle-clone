# Player Recovery Code Plan

## Objetivo

Implementar un flujo para que cada jugador con nombre unico tenga un codigo de recuperacion de 4 caracteres alfanumericos (`A-Z`, `0-9`), unico en Convex, visible en Profile y utilizable para recuperar su perfil en otro navegador.

## Alcance funcional

- Generar un codigo cuando el jugador deje de llamarse `Player` y pase a tener un nombre unico.
- Validar que el codigo no exista ya en Convex antes de asignarlo.
- Mostrar el codigo en la vista de Profile.
- Permitir recuperar el perfil desde el dialogo inicial mediante ese codigo.
- Crear un proceso de backfill para asignar codigo a los jugadores activos que ya existen.

## Decisiones de diseno

- El codigo tendra exactamente 4 caracteres alfanumericos en mayusculas.
- El codigo se almacenara en Convex como parte del perfil del jugador.
- El perfil local seguira viviendo en `localStorage`, pero Convex sera la fuente de verdad para recuperar por codigo.
- La generacion del codigo ocurrira en backend para garantizar unicidad real.
- No se debe crear ni fijar identidad remota en Convex hasta que el usuario tome una decision explicita en el dialogo inicial:
    - elegir un nombre unico para crear jugador nuevo
    - introducir un codigo para recuperar jugador existente
    - Si un navegador ya tenia un jugador local y despues recupera otro perfil por codigo, no se borra el registro remoto anterior.
    - En ese caso, simplemente se sobreescribe el estado local del navegador con el perfil recuperado y, a partir de ese momento, ese navegador pasa a trabajar con la identidad del nuevo codigo cargado.

## Riesgos a controlar

- Colisiones de codigo por longitud corta.
- Conflictos entre la identidad local actual del navegador y la identidad remota del jugador recuperado.
- Duplicidad de `nick` durante cambios de nombre y recuperacion.
- Divergencia entre estado local y remoto si falla la sincronizacion.

## Reglas operativas

### Regla 1: Estado inicial provisional

- Un navegador puede tener estado local con `player.name === "Player"` sin identidad remota consolidada.
- En ese estado no se debe crear registro remoto definitivo ni vinculo estable en Convex.
- Ese estado solo sirve para permitir entrar en la app y decidir despues si crear perfil nuevo o recuperar uno existente.

### Regla 2: Alta de jugador nuevo

- El alta real ocurre cuando el usuario cambia desde `Player` a un nombre unico valido.
- Esa operacion debe ejecutarse primero en Convex.
- Convex devuelve el perfil consolidado, incluyendo codigo e identidad tecnica.
- Solo despues de la respuesta correcta se persiste ese perfil en `localStorage`.

### Regla 3: Recuperacion por codigo

- Recuperar por codigo siempre consulta Convex.
- Si el codigo existe, el navegador reemplaza por completo el perfil local activo por el perfil recuperado.
- Ese reemplazo incluye identidad tecnica, para que las mutaciones futuras sigan actualizando el mismo jugador remoto.
- Si antes habia otro perfil local activo en ese navegador, no se elimina su registro remoto anterior.

### Regla 4: Cambio posterior de codigo en el mismo navegador

- Si un jugador ya activo en un navegador introduce otro codigo distinto y la recuperacion es valida, el browser abandona el perfil local anterior y adopta el nuevo.
- A partir de ese momento todas las operaciones de score, rename y sincronizacion se hacen sobre la identidad recuperada mas reciente.
- No se hace limpieza remota automatica del perfil local anterior.

### Regla 5: Unicidad de nickname

- La unicidad de nickname se valida siempre en backend.
- La comprobacion del frontend solo mejora UX y nunca sustituye la validacion en Convex.
- La validacion de nick debe ignorar el propio registro del jugador cuando se trate de un rename del mismo perfil.
- Recuperar por codigo no vuelve a competir por el nick, porque se trata del mismo perfil ya existente.

### Regla 6: Consistencia local/remota

- Las operaciones de identidad son `remote-first`.
- Se consideran operaciones de identidad:
- alta inicial por nombre unico
- recuperacion por codigo
- rename de perfil ya existente cuando afecte al registro remoto
- Si una operacion de identidad falla en Convex, no se debe dejar el browser en un estado local nuevo que el backend no reconozca.
- Las operaciones de score y streak pueden seguir con su estrategia de sincronizacion diferida si no alteran identidad.

## Solucion prevista para cada riesgo

### Colisiones de codigo por longitud corta

- El codigo se genera solo en Convex.
- Se usa alfabeto `A-Z0-9` y se normaliza a mayusculas.
- Antes de asignar, Convex consulta el indice por codigo.
- Si hay colision, reintenta hasta encontrar uno libre.
- Si se alcanza un maximo de intentos, la operacion falla con error explicito en lugar de asignar un codigo dudoso.

### Conflictos entre identidad local y perfil recuperado

- `getPlayerByCode` debe devolver tambien la identidad tecnica del perfil recuperado.
- El frontend debe tener un paso explicito de adopcion de identidad remota.
- Tras recuperar un codigo, el navegador deja de operar con la identidad local anterior y pasa a operar con la del perfil recuperado.
- No se deben mezclar scores ni updates entre la identidad previa del navegador y la nueva identidad recuperada.

### Duplicidad de nick

- `upsertPlayerProfile` debe validar disponibilidad real del nick en Convex.
- La validacion debe ignorar el propio registro si el jugador solo esta renombrando su mismo perfil.
- Si el nick ya pertenece a otro jugador, Convex rechaza la operacion.
- El frontend muestra error y conserva el estado anterior.

### Divergencia entre local y remoto

- Alta inicial y recuperacion por codigo no se consolidan en local hasta tener respuesta correcta del backend.
- Si Convex falla, el estado local previo se mantiene.
- No se genera codigo en frontend.
- No se persiste una identidad tecnica local que no exista ya en backend.
- Las escrituras tolerantes como score y streak pueden seguir con cola pendiente, pero no las operaciones de identidad.

## Fase 1: Modelo y backend Convex

### Objetivo

Extender el modelo remoto para soportar codigo de recuperacion y perfil completo.

### Cambios

- Extender `scores` en `convex/schema.ts` con:
- `playerCode`
- `difficulty`
- `keyboardPreference`
- Crear indice por codigo.
- Crear helpers en `convex/scores.ts` para:
- normalizar codigo
- generar codigo aleatorio
- reintentar hasta obtener uno libre
- detectar conflictos de nick ignorando el propio perfil cuando proceda
- Agregar operaciones nuevas:
- `scores:upsertPlayerProfile`
- `scores:getPlayerByCode`
- `scores:backfillPlayerCodes`

### Criterios de aceptacion

- Un jugador no puede terminar con un codigo repetido.
- `getPlayerByCode` devuelve el perfil correcto por codigo.
- `getPlayerByCode` devuelve tambien identidad tecnica suficiente para continuar operando con ese perfil.
- `upsertPlayerProfile` puede crear o actualizar perfil sin duplicar identidad.
- `upsertPlayerProfile` rechaza nick duplicado perteneciente a otro jugador.
- `backfillPlayerCodes` es idempotente.

## Fase 2: Dominio y tipos del jugador

### Objetivo

Reflejar el nuevo contrato en el estado local del player.

### Cambios

- Extender `Player` en `src/domain/wordle/player.ts` con `code`.
- Normalizar `code` en `src/providers/Player/utils.ts`.
- Actualizar `DEFAULT_PLAYER` en `src/providers/Player/constants.ts`.
- Ajustar tipos del contexto del player si aparecen nuevas operaciones.

### Criterios de aceptacion

- El estado local acepta perfiles antiguos sin romperse.
- Los perfiles nuevos persisten `code`.
- La normalizacion mantiene compatibilidad hacia atras.

## Fase 3: Cliente API y sincronizacion de identidad

### Objetivo

Permitir alta, actualizacion y recuperacion de perfil desde frontend.

### Cambios

- Extender `ScoreClient` con:
- `upsertPlayerProfile`
- `recoverPlayerByCode`
- `adoptRecoveredIdentity`
- Extender tipos de `src/api/score/types.ts` para el perfil remoto.
- Reutilizar `clientRecordId` y `clientId` de forma consistente tras una recuperacion.
- Evitar cualquier alta remota prematura antes de que el usuario elija entre nombre nuevo o recuperacion por codigo.
- Separar claramente operaciones de identidad de operaciones tolerantes con sync diferido.

### Punto critico

Recuperar un perfil en otro navegador no puede dejar al jugador trabajando con una identidad local distinta de la identidad remota recuperada. Tras recuperar, el navegador debe adoptar la identidad del perfil cargado y dejar de operar con la anterior.

### Criterios de aceptacion

- Mientras el usuario siga siendo `Player` y no haya confirmado nombre unico ni recuperacion por codigo, no se crea ni fija identidad remota.
- Tras recuperar por codigo, el navegador nuevo sigue actualizando el mismo jugador remoto.
- No se crean filas duplicadas por cambio de navegador.
- Si un navegador cambia despues a otro codigo, el perfil local anterior se sobreescribe y el navegador pasa a operar con el nuevo perfil recuperado.
- Si Convex no esta disponible, el flujo falla de forma controlada.
- `recordScore` y equivalentes no rompen el comportamiento actual para operaciones no identitarias.

## Fase 4: PlayerProvider y orquestacion

### Objetivo

Mover la logica de sincronizacion al lugar correcto sin meter reglas en las vistas.

### Cambios

- Ajustar `PlayerProvider` para sincronizar perfil completo.
- Cuando el nombre cambie desde `Player` a un nombre unico:
- validar disponibilidad
- pedir alta o actualizacion remota del perfil antes de consolidar local
- guardar el codigo recibido
- Al recuperar por codigo:
- reemplazar el player local completo
- adoptar identidad remota
- Si ya existia otro player local en ese navegador y se recupera un codigo distinto:
- no borrar el registro remoto anterior
- sobreescribir solo el estado local del navegador
- continuar desde ese momento con la identidad del perfil recuperado

### Criterios de aceptacion

- Cambiar el nombre por primera vez genera codigo.
- Cambiar nombre a otro nombre unico mantiene el perfil consistente.
- El codigo queda disponible en `localStorage` junto al resto del player.
- Recuperar otro codigo mas adelante reemplaza el perfil local activo del navegador sin necesidad de eliminar el remoto anterior.
- Si falla una operacion de identidad, el player local no queda en un estado intermedio inconsistente.

## Fase 5: UI de Profile

### Objetivo

Exponer el codigo al jugador de forma clara.

### Cambios

- Mostrar `code` en `ProfileCard`.
- Mostrar tambien `code` en modo edicion como solo lectura, o fuera del formulario si queda mas claro.
- Ajustar copy si hace falta para explicar que sirve para recuperar la cuenta en otro navegador.

### Criterios de aceptacion

- El jugador puede ver su codigo desde Profile.
- La UI no permite editar manualmente el codigo.
- El codigo aparece tras generar o recuperar perfil.

## Fase 6: Dialogo inicial y recuperacion

### Objetivo

Permitir entrar con nombre nuevo o recuperar por codigo desde el primer dialogo.

### Cambios

- Extender `InitialPlayerDialog` con un camino de recuperacion por codigo.
- Mantener el flujo actual de creacion por nombre.
- Hasta que el usuario elija una de las dos acciones, el navegador no consolida identidad remota.
- Validar codigo contra Convex.
- Si la recuperacion es correcta:
- cerrar dialogo
- hidratar player local
- continuar con la app
- Si la validacion remota falla:
- mantener el dialogo abierto
- no mutar el perfil local consolidado
- mostrar error claro

### Criterios de aceptacion

- Un usuario nuevo puede seguir creando perfil por nombre.
- Un usuario existente puede recuperar por codigo desde otro navegador.
- Si el codigo no existe, se muestra error claro y no se cierra el dialogo.

## Fase 7: Backfill de jugadores activos

### Objetivo

Asignar codigo a perfiles ya existentes en Convex.

### Cambios

- Crear una mutacion o accion de backfill en Convex.
- Crear un script operativo para ejecutarla.
- Anadir script npm para facilitar la ejecucion.

### Criterios de aceptacion

- El backfill asigna codigo solo a quien no lo tiene.
- Se puede lanzar varias veces sin corromper datos.
- Devuelve resumen de procesados, actualizados y omitidos.

## Fase 8: Tests

### Objetivo

Cubrir el cambio sin degradar comportamiento existente.

### Tests a tocar

- `src/api/score/ScoreClient.test.ts`
- `src/providers/Player/PlayerProvider.test.tsx`
- `src/App.test.tsx`
- `src/views/Profile/Profile.integration.test.tsx`
- Tests unitarios de Convex si se incorporan helpers aislables

### Casos minimos

- Generacion de codigo en alta por nombre unico.
- Reintento cuando hay colision de codigo.
- Recuperacion correcta por codigo.
- Recuperacion fallida por codigo invalido.
- Recuperacion de un segundo codigo en un navegador que ya tenia otro perfil activo.
- Rename rechazado por nick duplicado de otro jugador.
- Operacion de identidad fallida sin mutacion local inconsistente.
- Backfill idempotente.
- Compatibilidad con player legado sin `code`.

## Fase 9: Documentacion

### Cambios

- Actualizar `ARCHITECTURE.md` si cambia el contrato de persistencia.
- Actualizar `README.md` con el flujo de recuperacion y backfill.

### Criterios de aceptacion

- El contrato de `localStorage` refleja el nuevo campo `code`.
- El equipo puede ejecutar el backfill sin inspeccionar el codigo.

## Orden recomendado de implementacion

1. Backend Convex y schema.
2. Tipos de player y normalizacion local.
3. `ScoreClient` y adopcion de identidad.
4. `PlayerProvider`.
5. UI de Profile.
6. Dialogo inicial con recuperacion.
7. Backfill.
8. Tests y documentacion final.

## Estimacion

- Backend y modelo: 1 dia
- Cliente y proveedor: 1 a 1.5 dias
- UI y dialogos: 1 dia
- Backfill, tests y docs: 1 a 1.5 dias

Total estimado: 4 a 5 dias

## Siguiente paso

Empezar por Fase 1 y Fase 2 juntas, porque el resto depende de fijar bien el contrato remoto y el tipo `Player`.
