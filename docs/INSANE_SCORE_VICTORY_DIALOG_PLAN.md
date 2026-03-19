# Insane Score Victory Dialog Plan

## Objetivo

Implementar cuatro cambios coordinados entre Home y Profile:

- En dificultad `insane`, otorgar 1 punto extra por cada 2 segundos restantes al ganar.
- Actualizar la ayuda para explicar esa regla de puntuacion.
- Mostrar un dialogo de victoria al ganar en cualquier dificultad con la palabra, el resumen de puntuacion y un boton `Play again` que cierre el dialogo y reinicie la partida.
- Permitir en Profile configurar si se muestran o no los dialogos de fin de partida. Si esta desactivado, el comportamiento debe quedar como ahora. Si esta activado, deben mostrarse tanto al ganar como al perder.

## Alcance funcional

- El bonus de tiempo solo aplica en dificultad `insane`.
- El bonus de tiempo se calcula con los segundos restantes reales en el momento de la victoria.
- La ayuda debe explicar la nueva regla de puntuacion de `insane`.
- En Profile debe existir una preferencia para activar o desactivar los dialogos de fin de partida.
- La preferencia controla conjuntamente ambos dialogos: victoria y derrota.
- La preferencia debe venir activada por defecto.
- Al ganar en cualquier dificultad, debe abrirse un dialogo de victoria con:
- palabra correcta
- resumen de puntuacion
- streak actual
- accion `Play again`
- Al perder, si la preferencia esta activada, debe abrirse un dialogo de derrota.
- El dialogo de derrota debe mostrar:
- titulo `Game Over`
- la palabra correcta
- `Best streak`
- mensaje de cierre tipo `Suerte la proxima vez`
- boton principal para volver a jugar
- boton secundario outline para cambiar dificultad
- `Play again` debe reutilizar la misma logica de refresh/start-new ya existente para resetear tablero, hints y temporizador.
- Si la preferencia esta activada, el mensaje actual de win/lose no debe mostrarse.
- Si la preferencia esta desactivada, Home debe mantener exactamente el feedback actual.

## Decisiones de diseno

- La regla de puntuacion debe vivir en dominio y/o en el controlador, no en componentes de UI.
- El calculo del bonus de tiempo debe ser determinista y facil de testear.
- La opcion natural para la conversion es `Math.floor(secondsLeft / 2)`.
- El dialogo de victoria debe ser feature-scoped dentro de `src/views/Home/components/Dialogs/*`.
- El dialogo de derrota debe seguir el mismo patron de implementacion que el de victoria.
- La preferencia de mostrar dialogos de fin de partida debe vivir en el estado de `player` y persistirse con el resto del perfil local.
- La preferencia debe editarse desde `SettingsSection` en Profile.
- El boton `Cambiar dificultad` del dialogo de derrota debe navegar a `profile#difficulty`.
- Todo el copy visible debe pasar por i18n.

## Riesgos a controlar

- Duplicar reglas de scoring entre dominio, controlador y UI.
- Mostrar un resumen de puntos distinto del realmente persistido en `commitVictory`.
- Interferencias entre el nuevo dialogo de victoria y otros overlays ya existentes.
- Introducir una preferencia nueva en `player` sin normalizacion backward-compatible.
- Inconsistencias entre victoria y derrota si una respeta la preferencia y la otra no.
- Falsos positivos en tests por temporizador y cierre de partida.

## Reglas operativas

### Regla 1: Bonus de tiempo solo en insane

- `easy`, `normal` y `hard` mantienen el comportamiento actual.
- Solo `insane` suma bonus por segundos restantes.

### Regla 2: El dialogo de victoria aplica a todas las dificultades

- `easy`, `normal`, `hard` e `insane` deben mostrar el dialogo cuando `won === true`.
- El resumen de puntuacion puede variar segun la dificultad, pero el patron del dialogo es comun.

### Regla 3: La preferencia del jugador controla los dialogos de fin de partida

- Si el jugador activa la preferencia, al terminar la partida debe mostrarse un dialogo:
- de victoria cuando `won === true`
- de derrota cuando `won === false`
- Es una sola preferencia para ambos casos.
- Si el jugador desactiva la preferencia, Home debe mantener el flujo actual sin dialogo final adicional.

### Regla 4: El bonus se calcula al cerrar la victoria

- El valor debe salir del temporizador activo cuando la partida pasa a `won`.
- No debe recalcularse de forma distinta en la UI.

### Regla 5: El resumen de victoria debe reflejar el score real

- El total mostrado en el dialogo debe coincidir con el total enviado a `commitVictory`.
- Si se muestra desglose, debe incluir base, bonus de dificultad, bonus de racha y bonus de tiempo cuando aplique.

### Regla 6: Play again reutiliza la logica existente

- No se debe crear un flujo paralelo para reiniciar.
- Debe ejecutar la misma operacion que hoy reinicia tablero, temporizador y hints.

### Regla 7: El feedback final visible depende de la preferencia

- Con preferencia activada, se muestran dialogos de fin de partida y no se muestra el mensaje actual tipo toast.
- Con preferencia desactivada, se mantiene el comportamiento actual sin dialogos.

## Fase 1: Ajuste de scoring

### Objetivo

Incorporar el bonus por tiempo restante en `insane` sin romper la formula actual.

### Cambios

- Revisar `src/domain/wordle/scoring.ts`.
- Añadir helper especifico para bonus por tiempo restante o extender la API existente de scoring.
- Ajustar `src/views/Home/hooks/useHomeController/useHomeController.ts` para calcular el total final de victoria usando los segundos restantes cuando la dificultad sea `insane`.

### Criterios de aceptacion

- Ganar en `insane` con 10 segundos restantes suma 5 puntos extra.
- Ganar en `insane` con 11 segundos restantes suma 5 puntos extra si se usa `Math.floor`.
- Ganar con 0 o 1 segundos restantes no otorga bonus adicional.
- Otras dificultades no cambian su puntuacion.

## Fase 2: Modelo de salida para fin de partida

### Objetivo

Preparar desde el controlador todos los datos necesarios para los dialogos de fin de partida.

### Cambios

- Extender los tipos de `src/views/Home/hooks/useHomeController/types.ts`.
- Exponer en el controller estado derivado para:
- visibilidad del dialogo de victoria
- visibilidad del dialogo de derrota
- palabra final
- resumen de puntuacion
- accion para cerrar y jugar otra vez
- Mantener la logica de composicion en el controlador, no en la vista.

### Criterios de aceptacion

- La vista puede renderizar el dialogo sin recalcular negocio.
- El resumen de puntuacion es consistente con el score persistido.
- El mismo flujo sirve para todas las dificultades.
- La visibilidad final respeta la preferencia del jugador.
- El flujo sabe ocultar el mensaje actual cuando el dialogo final esta activo.

## Fase 3: Preferencia en Profile

### Objetivo

Permitir al jugador decidir si quiere ver dialogos al finalizar una partida.

### Cambios

- Extender `Player` y su normalizacion para incluir una preferencia booleana de dialogos de fin de partida.
- Actualizar `src/providers/Player/*` para persistir y exponer esa preferencia.
- Añadir el control en `SettingsSection`, manteniendo la orquestacion en `useProfileController`.
- Conservar compatibilidad con perfiles ya guardados en `localStorage`.

### Criterios de aceptacion

- La preferencia se puede cambiar desde Profile.
- La preferencia persiste tras recargar.
- Los perfiles antiguos se normalizan con la preferencia activada por defecto.

## Fase 4: Dialogos de fin de partida

### Objetivo

Crear los overlays de victoria y derrota y conectarlos al flujo de Home.

### Cambios

- Crear un nuevo dialogo en `src/views/Home/components/Dialogs/`.
- Crear el dialogo de derrota con el mismo patron.
- Integrarlo en `src/views/Home/sections/DialogsSection.tsx`.
- Reutilizar `Dialog` compartido.
- Añadir boton `Play again` conectado a la accion del controller.
- Añadir en derrota un boton secundario outline que navegue a `profile#difficulty`.

### Criterios de aceptacion

- Al ganar en cualquier dificultad se abre el dialogo.
- Al perder se abre el dialogo solo si la preferencia esta activada.
- El dialogo muestra la palabra correcta.
- El dialogo muestra el resumen de puntuacion.
- El dialogo de victoria muestra el streak actual.
- El resumen de puntuacion de victoria se presenta en columna, con desglose visual y una separacion final antes del total.
- El dialogo de derrota muestra `Game Over`, la palabra, `Best streak`, un mensaje de cierre y las dos acciones definidas.
- Al pulsar `Play again`, el dialogo se cierra y empieza una nueva partida limpia.
- Si la preferencia esta desactivada, no aparece ninguno de los dialogos y el flujo queda como ahora.
- Al pulsar `Cambiar dificultad`, la app navega a `profile#difficulty`.

## Fase 5: Update de help e i18n

### Objetivo

Actualizar la documentacion in-app de las reglas de puntuacion.

### Cambios

- Añadir nuevas claves en `src/i18n/resources.ts`.
- Actualizar `src/views/Home/components/Dialogs/HelpDialog/HelpDialog.tsx` para incluir la regla del bonus de tiempo en `insane`.
- Añadir copy del dialogo de victoria, del dialogo de derrota, del resumen de puntuacion y de la nueva preferencia en Profile.

### Criterios de aceptacion

- La ayuda explica claramente el bonus de `insane`.
- El dialogo de victoria no contiene strings hardcodeadas en JSX.
- El dialogo de derrota no contiene strings hardcodeadas en JSX.
- Profile no contiene strings hardcodeadas en JSX.

## Fase 6: Tests y validacion

### Objetivo

Cubrir el cambio de comportamiento y asegurar que el flujo queda estable.

### Cambios

- Actualizar o añadir tests en:
- `src/domain/wordle/scoring.test.ts`
- `src/views/Home/hooks/useHomeController/useHomeController.test.tsx`
- `src/views/Home/components/Dialogs/HelpDialog/HelpDialog.test.tsx`
- tests de los nuevos dialogos de fin de partida
- tests de Profile para la nueva preferencia
- Ejecutar validacion dirigida y despues `npm run lint-typecheck`.

### Criterios de aceptacion

- El bonus de tiempo queda cubierto por tests unitarios.
- La help renderiza la nueva informacion.
- El dialogo aparece al ganar cuando la preferencia esta activada.
- El dialogo aparece al perder cuando la preferencia esta activada.
- Si la preferencia esta desactivada, el flujo sigue como ahora.
- `Play again` reinicia correctamente desde ambos dialogos.
- El boton `Cambiar dificultad` navega a `profile#difficulty`.
- El mensaje actual solo se renderiza cuando la preferencia esta desactivada.
- El tipado queda limpio.
