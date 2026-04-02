# Prop Drilling Analysis

Fecha del análisis inicial: 2026-04-02  
Fecha de re-auditoría: 2026-04-02 (actualizada tras refactor de `Board`)

## Estado del audit (hecho vs pendiente)

| Ítem del audit anterior                                             | Estado    | Evidencia                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Integrar provider de `Play` para cortar paso manual entre secciones | `HECHO`   | [Play.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/Play.tsx:28)                                                                                                                                                                                                                   |
| Quitar paso masivo de props en `Play -> Sections`                   | `HECHO`   | [Play.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/Play.tsx:13)                                                                                                                                                                                                                   |
| Eliminar `usePlaySections` (hook embudo)                            | `HECHO`   | no hay referencias en `src` (`rg usePlaySections` sin resultados)                                                                                                                                                                                                                                                                       |
| Reducir tamaño de contratos de `sections/types.ts`                  | `HECHO`   | [types.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/sections/types.ts:8)                                                                                                                                                                                                           |
| Reducir cadena profunda de board (`Board -> Row -> Tile`)           | `HECHO`   | `Row` ahora recibe `row` único y `Tile` recibe `tile` único: [Row.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/components/Board/Row.tsx:5), [Tile.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/components/Board/Tile.tsx:6) |
| Reducir fan-out de datos en `DialogsSection`                        | `PARCIAL` | ya no hay drilling desde `Play`, pero sigue orquestando muchos campos: [DialogsSection.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/sections/DialogsSection.tsx:34)                                                                                                               |

## Resultado actual (resumen)

- Se eliminó el **prop drilling crítico de capa de ruta** en `Play`.
- Ya no existe el contrato gigante de props entre `Play` y sus secciones.
- El problema que queda es **local** y está más concentrado en `DialogsSection`.

## Prop drilling que todavía queda

### 1) Board chain (`BAJO`, mejorado)

Estado actual:

1. `Board` pasa un único `row` a `Row`: [Board.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/components/Board/Board.tsx:61)
2. `Row` pasa un único `tile` a `Tile`: [Row.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/components/Board/Row.tsx:37)
3. El armado del view-model quedó centralizado en `useBoardController`: [useBoardController.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/components/Board/useBoardController.ts:67)

Indicadores de mejora:

- `RowPropsType`: de múltiples escalares a 2 campos (`row` + tooltip): [types.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/components/Board/types.ts:18)
- `TilePropsType`: 1 campo (`tile`): [types.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/components/Board/types.ts:41)
- `BoardRowViewModel` ahora contiene `tiles` precomputados: [types.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/components/Board/types.ts:23)

Impacto:

- Se redujo significativamente el drilling dentro de `Board`.
- Aun existe paso de datos entre `BoardSection -> BoardContent -> Board`, pero la parte más costosa (`Row`/`Tile`) quedó compactada.

### 2) Dialog orchestration fan-out (`MEDIO`)

`DialogsSection` ahora consume contexto (bien), pero sigue extrayendo y repartiendo muchas piezas del controller:

- extracción extensa: [DialogsSection.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/sections/DialogsSection.tsx:34)
- ejemplo de contrato aún grande (`DeveloperConsoleDialogProps`, 10 campos): [types.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/components/Dialogs/types.ts:6)

Impacto:

- Ya no es drilling transversal de ruta, pero sí hay acoplamiento en la sección de diálogos.

### 3) Caso menor fuera de Play (`BAJO`)

`SettingsSection -> DifficultySection` pasa 4 props en un salto:

- origen: [SettingsSection.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Profile/sections/SettingsSection/SettingsSection.tsx:91)
- destino: [DifficultySection.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Profile/sections/DifficultySection/DifficultySection.tsx:13)

Esto es aceptable y no es un hotspot.

## Conclusión

- `Play` dejó de tener el problema grave de drilling por capas.
- El audit anterior está mayormente completado y el punto de `Board -> Row -> Tile` ya está cerrado.
- Lo pendiente principal queda en `DialogsSection` (fan-out/orquestación).
