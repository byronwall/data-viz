# Line Chart Implementation Plan

## Overview

The line chart component will be implemented following the existing patterns from ScatterPlot and BoxPlot components. It will integrate with the chart registry system and support all core features outlined in the requirements.

## File Structure

```
src/
  components/
    charts/
      LineChart/
        LineChart.tsx         # Main chart component
        LineChartSettingsPanel.tsx  # Settings UI
        definition.ts         # Chart type definition and settings
        lineChartCalculations.ts    # Helper functions for data processing
```

## Interfaces and Types

### LineChartSettings (in definition.ts)

```typescript
export interface LineChartSettings extends BaseChartSettings {
  type: "line";

  // Data fields
  xField: string;
  seriesField?: string; // Optional field for multiple series

  // Line styling
  styles: {
    lineWidth: number;
    lineOpacity: number;
    curveType: "linear" | "monotoneX" | "step";
    showPoints: boolean;
    pointSize: number;
    pointOpacity: number;
  };

  // Grid options
  showXGrid: boolean;
  showYGrid: boolean;

  // Tooltip configuration
  tooltipFormat?: {
    x?: string;
    y?: string;
  };

  // Legend options
  showLegend: boolean;
  legendPosition: "top" | "right" | "bottom" | "left";
}
```

### Chart Definition (in definition.ts)

```typescript
export const lineChartDefinition: ChartDefinition<LineChartSettings> = {
  type: "line",
  name: "Line Chart",
  description: "Display data as connected points over time or sequence",
  icon: LineChart,

  component: LineChart,
  settingsPanel: LineChartSettingsPanel,

  createDefaultSettings,
  validateSettings,
  getFilterFunction,
};
```

## Core Components

### LineChart.tsx

Main features:

- SVG-based rendering using d3 scales
- Support for multiple data series
- Interactive tooltips using shadcn/ui Tooltip
- Responsive design
- Integration with faceting system
- Brush selection for filtering
- Legend support using existing patterns
- Assign a unique color to each series from a pallette - allow user to override single series or the pallette

### LineChartSettingsPanel.tsx

Settings UI for configuring:

- Data field mappings (x, series) via FieldSelector and MultiSelect
- Line styling options
- Axis configuration
- Grid display
- Tooltip format
- Legend position

## Integration Points

1. Chart Registry

   - Add line chart definition to registry.ts
   - Register in the initialization

2. Data Layer Integration

   - Use useDataLayer for state management
   - Implement filter functions
   - Support live data updates

3. Faceting Support
   - Register axis limits
   - Support synchronized scales
   - Handle facet-specific rendering

## Implementation Phases

### Phase 1: Core Chart Component

- [ ] Basic component structure

  - [ ] Component scaffolding
  - [ ] Props and settings interfaces
  - [ ] Basic SVG setup

- [ ] Data handling

  - [ ] Data processing utilities
  - [ ] Scale creation
  - [ ] Line generation

- [ ] Basic rendering
  - [ ] Single line plotting
  - [ ] Axes integration
  - [ ] Responsive container

### Phase 2: Multiple Series Support

- [ ] Series handling

  - [ ] Data grouping by series
  - [ ] Color assignment
  - [ ] Legend integration

- [ ] Enhanced rendering
  - [ ] Multiple line paths
  - [ ] Point markers
  - [ ] Grid lines

### Phase 3: Interactivity

- [ ] Tooltip implementation

  - [ ] Hover detection
  - [ ] Data point highlighting
  - [ ] Formatted display

- [ ] Brush selection
  - [ ] Area selection
  - [ ] Filter integration
  - [ ] Visual feedback

### Phase 4: Settings Panel

- [ ] Settings UI

  - [ ] Field selectors
  - [ ] Style controls
  - [ ] Format options

- [ ] Preview updates
  - [ ] Live preview
  - [ ] Validation

## Current Progress

No work started yet.

### Next steps

1. Create initial file structure
2. Implement basic LineChart component with single series support
3. Add settings panel with core options
4. Integrate with chart registry
5. Add multiple series support
6. Implement interactive features
7. Add advanced features (zoom, brush selection)
