# Props Spread Audit

Fecha del análisis: 2026-04-02
Fecha de actualización (post-refactor): 2026-04-02

## Criterio

- `Innecesario probable`: el spread se puede sustituir por props explícitas sin perder flexibilidad real.
- `Justificado`: el spread aporta flexibilidad clara o reduce duplicación útil.

## Estado actual

| Archivo                                                                 | Línea(s)                           | Uso                                        | Evaluación  | Nota                                                                        |
| ----------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------ | ----------- | --------------------------------------------------------------------------- |
| `src/components/Button/Button.tsx`                                      | 14, 21                             | `...props` + `<button {...props}>`         | Justificado | Wrapper de `<button>` que debe permitir `aria-*`, `data-*` y attrs nativos. |
| `src/components/Dialogs/ConfirmationDialog/ConfirmationDialog.test.tsx` | 36, 41, 46, 51, 56, 61, 66, 78, 90 | `<ConfirmationDialog {...defaultProps} />` | Justificado | En tests reduce repetición y mantiene fixture base centralizado.            |

## Resumen rápido

- Total spreads de props en JSX: 10
- Producción: 1
- Tests: 9
- Innecesario probable (producción): 0
- Justificado: 10 (1 en producción + 9 en tests)

## Casos corregidos en esta implementación

- `src/views/Play/Play.tsx`
- `src/views/Play/sections/BoardSection.tsx`
- `src/views/Play/sections/Toolbar.tsx`
