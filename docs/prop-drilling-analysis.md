# Prop Drilling Analysis

Fecha: 2026-04-02
Repositorio: `wordle-clone`

## Objetivo

Analizar dónde se están pasando props por demasiados niveles y cuantificar los puntos con mayor complejidad de paso.

## Metodología

- Revisión de contratos de props en `src/views/*/sections/types.ts`.
- Revisión de flujo `controller -> sección -> componente hoja` en `Play`.
- Comparativa con `Profile` para ver un patrón alternativo existente en el repo.

## Resumen ejecutivo

- El problema está concentrado en `Play`.
- El mayor hotspot es `DialogsSection`, con un contrato de **31 props**.
- Hay cadenas de paso de hasta **8 capas** (caso `Board -> Row -> Tile` para estados de hint/animación).
- `usePlaySections` está actuando como gran “re-empaquetador” de estado (desestructura **65 campos** del controller).
- `Profile` ya usa provider local y evita casi todo el drilling transversal.

## Hallazgos principales

### 1) Hotspot crítico: `DialogsSection` (31 props)

Evidencia:

- Contrato de `DialogsSectionProps` con 31 props en [types.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/sections/types.ts:84).
- Construcción masiva de `dialogsProps` en [usePlaySections.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/hooks/usePlaySections.ts:223).
- Paso explícito de todas esas props desde `Play` en [Play.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/Play.tsx:19).
- `DialogsSection` vuelve a repartir parte de ese contrato a subdiálogos en [DialogsSection.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/sections/DialogsSection.tsx:30).

Impacto:

- Alto acoplamiento entre `usePlayController`, `usePlaySections`, `Play` y `DialogsSection`.
- Cualquier cambio de una prop de diálogo impacta múltiples archivos/capas.

### 2) Cadena larga en board rendering (hasta 8 capas)

Caso representativo: `hintRevealPulse`.

Ruta de paso:

1. `useWordle` expone `hintRevealPulse` en [useWordle.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/hooks/useWordle/useWordle.ts:505).
2. `usePlayController` arrastra todo `wordle` con spread en [usePlayController.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/hooks/usePlayController/usePlayController.ts:492).
3. `usePlaySections` lo mete en `board` en [usePlaySections.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/hooks/usePlaySections.ts:166).
4. `Play` pasa `board` a `BoardSection` en [Play.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/Play.tsx:78).
5. `BoardSection` lo pasa a `BoardContent` en [BoardSection.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/sections/BoardSection.tsx:136).
6. `BoardContent` lo pasa a `Board` en [BoardSection.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/sections/BoardSection.tsx:39).
7. `Board` lo pasa a `Row` en [Board.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/components/Board/Board.tsx:67).
8. `Row` lo pasa a `Tile` en [Row.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/components/Board/Row.tsx:57).

Impacto:

- Profundidad alta para estado visual fino (hint/animación).
- Dificulta detectar “quién necesita realmente qué”.

### 3) `usePlaySections` como embudo de acoplamiento

Evidencia:

- Doble destructuring muy grande del controller en [usePlaySections.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/hooks/usePlaySections.ts:25).
- Re-empaquetado en `toolbarProps`, `boardProps`, `keyboardProps`, `dialogsProps` en [usePlaySections.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/hooks/usePlaySections.ts:102).

Métricas aproximadas:

- Campos leídos de `controller` en este hook: **65**.
- Tamaño de contratos por sección:
  - `DialogsSectionProps`: **31**
  - `ToolbarProps`: **18** (incluyendo objeto `timer`)
  - `BoardContentProps`: **15**
  - `KeyboardSectionProps`: **8**

Impacto:

- El hook centraliza demasiado conocimiento de subárboles de UI.
- Incrementa coste de mantenimiento y revisiones.

### 4) Contraste positivo: `Profile` evita drilling entre secciones

Evidencia:

- `Profile` envuelve en provider en [Profile.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Profile/Profile.tsx:27).
- Secciones consumen contexto directamente (ejemplo) en [ProfileEditorSection.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Profile/sections/ProfileEditorSection/ProfileEditorSection.tsx:5).

Observación:

- Este patrón reduce el paso manual de props a través de múltiples capas de composición.

### 5) Oportunidad clara: existe `PlayViewProvider`, pero no está integrado

Evidencia:

- Provider de `Play` ya implementado en [PlayViewProvider.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/providers/PlayViewProvider.tsx:8).
- Hook de consumo listo en [usePlayView.ts](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/providers/usePlayView.ts:5).
- `Play.tsx` actual no lo utiliza en [Play.tsx](/Users/sito8943/Documents/HSCode/HS%20Ecole/Frontend%20Frameworks/wordle-clone/src/views/Play/Play.tsx:11).

## Priorización de problemas

1. `DialogsSection` por tamaño de contrato y fan-out a varios diálogos.
2. Cadena de board/hints por profundidad de paso.
3. `usePlaySections` por concentración de dependencias.

## Conclusión

El “prop drilling” fuerte no está repartido por toda la app: está principalmente en `Play`.  
`Profile` ya demuestra un patrón más estable basado en provider local.  
La base para aplicar ese mismo patrón en `Play` ya existe (`PlayViewProvider`), por lo que el problema es más de integración/modularización que de ausencia de infraestructura.
