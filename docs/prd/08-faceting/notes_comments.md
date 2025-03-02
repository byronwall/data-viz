# Notes and comments for faceting

- Need to ensure the zustand hooks are single access - avoid infinite re-renders
- Only the Row chart works currently - need to resolve axis problems and apply to all charts
- Fix the bar chart and verify facetting works
- Need to show all facets - show blanks when filtering - add an option to hide facets in wrap mode

## Conclusions

- The adjusted layout stuff was making a mess of things - should have not allowed

## Issues to resolve in new work

- The colorScaleId should not be saved - or need to save the scales too
- Decide if it is worth allowing the y categories to be globally shared in Row charts w/ facets
- Need to implement the full suite of control for axis limits - scatter defaults to all available global data
