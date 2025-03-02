# Notes and comments for faceting

- Need to ensure the zustand hooks are single access - avoid infinite re-renders
- Clean up the `FacetContainer` component - types are bad
- Only the Row chart works currently - need to resolve axis problems and apply to all charts
- The colorScaleId should not be saved - or need to save the scales too

## Decisions

- Decide if it is worth allowing the y categories to be globally shared in Row charts w/ facets

## Conclusions

- The adjusted layout stuff was making a mess of things - should have not allowed
