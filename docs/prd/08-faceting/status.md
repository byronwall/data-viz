## Implementation Plan

### Phase 1: Data Model Updates

1. Update `ChartTypes.ts` to include faceting settings

   - Add facet configuration to `BaseChartSettings` using discriminated union
   - Define facet types (grid/wrap)
   - Add facet-specific properties

2. Create a facet context provider
   - Implement a hook with context for sharing axis limits between faceted charts
   - Track extreme axis limits across all facets (both numerical and categorical)
   - Provide methods for charts to broadcast and consume axis limits

### Phase 2: Facet Layout Components

1. Create a `FacetGridLayout` component

   - Use a table layout for grid faceting
   - Support row and column headers for facet values
   - Handle proper sizing of child charts

2. Create a `FacetWrapLayout` component

   - Use flexbox/grid for wrapped layout
   - Support configurable number of columns
   - Handle proper sizing of child charts

3. Create a `FacetContainer` component
   - Determine which layout to use based on settings
   - Handle data splitting for facets
   - Pass appropriate data subsets to child charts

### Phase 3: Chart Component Updates

1. Update `PlotChartPanel.tsx`

   - Add support for rendering in facet mode
   - Handle size constraints when in a facet

2. Update each chart component to support faceting:

   - `BarChart.tsx`
   - `RowChart.tsx`
   - `ScatterPlot.tsx`
   - `PivotTable.tsx`
   - Ensure charts can render with facet-specific data
   - Implement axis synchronization

3. Update `BaseChart.tsx`
   - Add facet-specific rendering logic
   - Support synchronized axes across facets

### Phase 4: UI Controls for Faceting

1. Update `ChartSettingsContent.tsx`

   - Add facet configuration options
   - Support selection of facet variables
   - Toggle between grid and wrap modes

2. Update `PlotManager.tsx`
   - Handle faceted chart layouts in the grid
   - Adjust sizing logic for faceted charts

## Status

### Phase 1: Data Model Updates

- [ ] Update ChartTypes.ts
  - [ ] Add FacetSettings discriminated union
  - [ ] Update BaseChartSettings
- [ ] Create FacetAxisProvider
  - [ ] Implement context for axis synchronization (numerical and categorical)
  - [ ] Add hooks for registering and retrieving axis limits

### Phase 2: Facet Layout Components

- [ ] Create FacetContainer component
  - [ ] Implement data splitting logic
  - [ ] Add conditional rendering for grid vs wrap
- [ ] Create FacetGridLayout component
  - [ ] Implement table-based layout
  - [ ] Support row and column headers
- [ ] Create FacetWrapLayout component
  - [ ] Implement grid-based layout
  - [ ] Support configurable columns

### Phase 3: Chart Component Updates

- [ ] Update PlotChartPanel.tsx
  - [ ] Add facet container integration
  - [ ] Handle facet-specific rendering
- [ ] Update chart components
  - [ ] BarChart.tsx
  - [ ] RowChart.tsx
  - [ ] ScatterPlot.tsx
  - [ ] PivotTable.tsx
- [ ] Update useGetLiveData.tsx
  - [ ] Add support for facet-specific data filtering

### Phase 4: UI Controls for Faceting

- [ ] Update ChartSettingsContent.tsx
  - [ ] Add facet configuration UI
  - [ ] Support variable selection for faceting
- [ ] Update PlotManager.tsx
  - [ ] Handle faceted chart layouts

## Current Progress

- Initial plan created
- Requirements analyzed
- Implementation approach defined

### Next steps

- Update ChartTypes.ts with facet settings discriminated union
- Create FacetAxisProvider for axis synchronization (numerical and categorical)
- Implement FacetContainer component
- Update chart components to support faceting
