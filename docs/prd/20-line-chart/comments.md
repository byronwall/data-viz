# Line Chart Comments

- Use the `MultiSelect` component for the `seriesField` selector.
- Use the proper data access functions (common ones listed below) in the `LineChart` component.
- Legend does not render
- Lines do not have unique colors assigned to them
- Need to be able to move a series to the right axis
- Revise the settings to create a `SeriesSettings` object that can be used to configure the series for the chart. To include:
  - `showPoints`
  - `pointSize`
  - `pointOpacity`
  - `lineWidth`
  - `lineOpacity`
  - `lineColor`
  - `lineStyle`
- Create a `LineSeriesSettings` comp that can be shown in its own tab in the settings to control the parameters above. It should render in a nice grid or table.
- Gridline settings should move to the axis tab and be available on a variety of chart types

## Common Data Access Functions

```tsx
const updateChart = useDataLayer((s) => s.updateChart);
const { getColorForValue } = useColorScales();
const registerAxisLimits = useFacetAxis((s) => s.registerAxisLimits);
const getGlobalAxisLimits = useFacetAxis((s) => s.getGlobalAxisLimits);

// Get all data for axis limits calculation
const allData = useGetColumnDataForIds(settings.field);

// Get filtered data for rendering
const liveData = useGetLiveData(settings, settings.field, facetIds);
```

## Later
