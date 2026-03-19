# PLAN

## Objetivo

Corregir los problemas de performance detectados en la app, priorizando los cuellos de botella reales en `Home`, persistencia del tablero y carga del scoreboard.

## Prioridad 1: Reducir rerenders en Home

### Problema

El `HomeViewProvider` expone un `controller` muy grande por contexto. Cambios frecuentes como tecleo, timer, mensajes o pulsos de animación invalidan casi toda la pantalla.

### Acción

- Dividir el contexto de `Home` en slices más pequeñas, o eliminar el contexto agregado y hacer que cada sección consuma solo la parte del estado que necesita.
- Separar claramente:
  - `BoardSection`
  - `KeyboardSection`
  - `Toolbar`
  - `DialogsSection`

### Resultado esperado

- Menos rerenders por tecla.
- Menos rerenders por tick del timer.
- Menor trabajo de reconciliación en `Home`.

---

## Prioridad 2: Sacar `localStorage` del path de tecleo

### Problema

Cada alta o borrado de letra persiste el estado inmediatamente con `JSON.stringify` + `localStorage.setItem`, bloqueando el hilo principal.

### Acción

- Mantener el estado del juego inmediato en React.
- Mover la persistencia a un `useEffect` con debounce corto, por ejemplo `100-200ms`.
- Hacer persistencia inmediata solo en eventos importantes:
  - submit de palabra
  - refresh
  - derrota forzada
  - cambio de tablero
  - salida/unload si aplica

### Restricción

- Mantener intacto el contrato actual de storage.

### Resultado esperado

- Escritura mucho más barata durante tecleo.
- Mejor respuesta en móvil y dispositivos lentos.

---

## Prioridad 3: Aislar el timer de modo insane

### Problema

`hardModeSecondsLeft`, `hardModeTickPulse` y `boardShakePulse` actualizan el controller completo y arrastran rerenders en zonas que no dependen del timer.

### Acción

- Encapsular el estado del timer en una capa o slice independiente.
- Hacer que solo se rerendericen:
  - contador visual
  - barra de progreso final
  - board shake si corresponde

### Resultado esperado

- El modo `insane` deja de forzar rerenders globales cada segundo.
- Menor coste sostenido durante partidas activas.

---

## Prioridad 4: Evitar bloqueo en la carga del scoreboard

### Problema

`listTopScores()` espera a sincronizar pendientes antes de devolver resultados. Si hay varias entradas offline, la pantalla puede tardar en mostrar datos.

### Acción

- Mostrar primero datos disponibles:
  - cache local
  - remoto si ya está accesible
- Ejecutar la sincronización pendiente en segundo plano.
- Invalidar/refrescar la query al terminar.
- Revisar si el flush secuencial puede reducirse o agruparse.

### Resultado esperado

- Scoreboard visible antes.
- Mejor percepción de carga.
- Menos dependencia del número de pendientes.

---

## Prioridad 5: Reducir renders accesorios

### Problema

Hay componentes pequeños que actualizan estado más de lo necesario, como el footer en scroll.

### Acción

- Añadir guard clause para evitar `setState` si el valor visible/no visible no cambió.
- Si sigue siendo ruidoso, usar `requestAnimationFrame` o throttle ligero.
- Aplicar `memo` solo en componentes con props estables y ahorro demostrable.

### Resultado esperado

- Menos trabajo innecesario durante scroll.
- Mejor consistencia general sin refactor excesivo.

---

## Prioridad 6: Añadir tests de protección

### Acción

Añadir o actualizar tests para cubrir:

- Persistencia diferida del juego sin pérdida de progreso.
- Ausencia de invalidación transversal en `Home` por tecleo o timer.
- Scoreboard funcional aunque existan pendientes offline.

### Resultado esperado

- Cambios de performance protegidos contra regresiones.
- Refactors futuros más seguros.

---

## Prioridad 7: Medición antes y después

### Acción

Validar con profiling real:

- React DevTools Profiler en `Home`
- conteo de renders por sección
- prueba manual de tecleo en móvil/devtools
- prueba del scoreboard con cola pendiente

### Métricas a observar

- renders por tecla
- renders por segundo en modo `insane`
- tiempo hasta mostrar scoreboard
- suavidad percibida al teclear

---

## Orden de ejecución recomendado

1. Reducir rerenders en `Home`
2. Diferir persistencia de `localStorage`
3. Aislar timer de `insane`
4. Desbloquear carga del scoreboard
5. Ajustar renders accesorios
6. Añadir tests
7. Medir antes y después

## Impacto esperado

Los mayores beneficios deberían venir de los pasos 1, 2 y 3. Esos tres cambios atacan casi todo el coste perceptible de interacción en la app.
