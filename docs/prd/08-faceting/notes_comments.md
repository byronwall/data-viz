# Notes and comments for faceting

- Remove the `facetIds` field from `BaseChartSettings` - these are computed in the `FacetContainer` component
- Review the height + width for a facet wrap item - seems like need both supplied to chart
- Review how `renderChart` gets height and width - don't see props
- Facet wrap is using `grid` layout
- The height and width logic is bad for the `PlotChartPanel` - need to fix that
- Need to ensure the zustand hooks are single access - avoid infinite re-renders

## Conclusions

- The adjusted layout stuff was making a mess of things - should have not allowed
