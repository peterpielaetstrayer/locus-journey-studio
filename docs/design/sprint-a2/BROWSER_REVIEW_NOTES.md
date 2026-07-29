# Sprint A2 Browser Review Notes

**Reviewed:** July 29, 2026  
**Viewport:** 1440×900 (primary), spot-check mobile structure  
**Server:** localhost:3001

## Issue log

| Screen | Issue | Severity | Fix | Rechecked |
|---|---|---:|---|---:|
| Journey Awakening | Content block aligned to right on wide desktop due to flex `items-end` on scene container | High | Added `self-start` to inner layout wrapper | ✓ |
| Journey Awakening | Environmental SVG very dark; limited place-first impact vs north-star | Medium | Documented asset gap; preserved SVG + gradient fallback | — |
| Journey Awakening | Atlas preview and fog map compete for attention below fold on short viewports | Low | Reduced max-width; kept atlas secondary | ✓ |
| Water Fingerprint | Capture slab hidden below field nav / clipped by scene overflow | High | Fixed dock positioning above nav (`evidence-capture-slab--dock`) | ✓ |
| Water Fingerprint | Full observation form visible before mode selection | Medium | Form reveals only after capture mode chosen | ✓ |
| Water Fingerprint | Production `.webp` absent; scene reads as gradient placeholder | Medium | Documented; SVG fallback retained | — |
| Cypress-Knee Mystery | Response tools and safety slab initially below fold | High | Docked interaction slab; added header bottom padding | ✓ |
| Cypress-Knee Mystery | Theory overlay can overlap prompt on small heights | Low | Positioned with top offset; acceptable for prototype | ✓ |
| Cypress-Knee Mystery | Adaptive disclosure competed with question (pre-refactor) | Medium | Moved to subtle secondary line via `EvidenceQuestion` | ✓ |
| Living Atlas | Assembly step felt like generic form (pre-refactor) | Medium | Field-sheet plate preparation treatment | ✓ |
| Living Atlas | Primary image used `shorelineTransfer` fallback | High | Resolved to water fingerprint / cypress knees from learner notes | ✓ |
| Living Atlas | Systems map legibility weak in first pass | Medium | `AtlasCausalSystem` with nodes, dashed edges, text alt | ✓ |

## Sprint decision

```text
READY TO FREEZE — refinement complete and definition of done met
```

## Remaining limitations

- Production `.webp` assets not yet licensed/dropped for route-awakening, water-fingerprint, cypress-knees
- Environmental scenes rely on SVG placeholders in dev
- Atlas spread is responsive sequence, not literal two-page print layout at all breakpoints
- Simulated capture modes disclosed but not functional camera/mic
