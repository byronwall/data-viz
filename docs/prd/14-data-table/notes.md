# Data Table Notes

- Settings, columns, `type` is probably not needed - determine at runtime
- Need to implement row selection
- Pagination is a bunch of TODOs
- Search and export are TODOs
- Add + remove grouping is a TODO

## Adding a new chart touches

End goal is to get all these defs into a common object structure so adding a new chart is less painful.

1. Type Definitions:

   - `src/types/ChartTypes.ts`: Add new chart type to `CHART_TYPES` array and create interface
   - `src/types/create[ChartName]Settings.ts`: Create settings factory function
   - `src/utils/defaultSettings.ts`: Add default settings for new chart type

2. Component Integration:

   - `src/components/charts/ChartRenderer.tsx`: Add new case to render component
   - `src/components/charts/[ChartName]/[ChartName].tsx`: Create new chart component
   - `src/components/charts/ChartCreationButtons.tsx`: Add creation button if needed
   - `src/components/charts/ChartSettingsTab.tsx`: Add settings panel for new chart type
   - `src/components/charts/ChartSettingsPanel.tsx`: Add settings UI components

3. Hook Updates:

   - `src/hooks/useCreateCharts.ts`: Add new chart type to creation logic

4. Layout:

   - `src/components/charts/ChartGridLayout.tsx`: Update if new chart needs special layout handling

5. Data Layer:

   - `src/providers/DataLayerProvider.tsx`: Update if new chart needs special data handling

6. Tests:
   - Add tests for new chart component
   - Add tests for settings factory
   - Update existing chart tests if needed
