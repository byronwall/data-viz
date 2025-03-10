# Color Legend Implementation Plan

## Type Definitions

Location: `src/components/charts/ColorLegend/types.ts`

```typescript
import { BaseChartSettings } from "@/types/ChartTypes";

export interface ColorLegendSettings extends BaseChartSettings {
  type: "color-legend";
  showTitle: boolean;
  showSearch: boolean;
  compact: boolean;
}
```

## Component Structure

### ColorLegendChart Component

Location: `src/components/charts/ColorLegend/ColorLegendChart.tsx`

Main chart component that renders the list of color scales:

```typescript
import { BaseChartProps } from "@/types/ChartTypes";

export function ColorLegendChart({
  settings,
  width,
  height,
}: BaseChartProps<ColorLegendSettings>) {
  // Implementation here
}
```

### ColorLegendSettingsPanel Component

Location: `src/components/charts/ColorLegend/ColorLegendSettingsPanel.tsx`

Settings panel for configuring the color legend display:

```typescript
import { ChartSettingsPanelProps } from "@/types/ChartTypes";

export function ColorLegendSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<ColorLegendSettings>) {
  // Implementation here
}
```

### Chart Definition

Location: `src/components/charts/ColorLegend/definition.ts`

```typescript
import { ChartDefinition } from "@/types/ChartTypes";
import { List } from "lucide-react";

export const colorLegendDefinition: ChartDefinition<ColorLegendSettings> = {
  type: "color-legend",
  name: "Color Legend",
  description: "Display and manage color scales used in visualizations",
  icon: List,
  component: ColorLegendChart,
  settingsPanel: ColorLegendSettingsPanel,

  createDefaultSettings: (layout) => ({
    id: crypto.randomUUID(),
    type: "color-legend",
    title: "Color Legend",
    field: "",
    layout,
    colorScaleId: undefined,
    colorField: undefined,
    facet: {
      enabled: false,
      type: "grid",
      rowVariable: "",
      columnVariable: "",
    },
    xAxis: {},
    yAxis: {},
    margin: {},
    filters: [],
    xAxisLabel: "",
    yAxisLabel: "",
    xGridLines: 0,
    yGridLines: 0,
    showTitle: true,
    showSearch: true,
    compact: false,
  }),

  validateSettings: () => true,
  getFilterFunction: () => () => true,
};
```

## Implementation Phases

### Phase 1: Core Setup

- [ ] Type definitions and chart registration
  - [ ] Create ColorLegendSettings interface
  - [ ] Create chart definition file
  - [ ] Add to chart registry
  - [ ] Create basic component files

### Phase 2: Basic Component Implementation

- [ ] ColorLegendChart implementation
  - [ ] Basic layout structure
  - [ ] Integration with useColorScales hook
  - [ ] List view of color scales
  - [ ] Responsive container handling

### Phase 3: Color Scale Display

- [ ] Numerical color scale display
  - [ ] Gradient visualization
  - [ ] Min/max labels
  - [ ] Scale name display
- [ ] Categorical color scale display
  - [ ] Color blocks grid
  - [ ] Category labels
  - [ ] Overflow handling

### Phase 4: Settings Panel

- [ ] Settings panel implementation
  - [ ] Show/hide title toggle
  - [ ] Show/hide search toggle
  - [ ] Compact mode toggle
  - [ ] Basic layout options

## Status

### Current Progress

- Initial requirements gathered
- Implementation plan revised for chart type structure
- Type definitions outlined

### Next Steps

- Begin Phase 1: Core Setup
- Create initial type definitions
- Add to chart registry
- Create basic component structure

## Integration Notes

1. The color legend will be registered as a chart type similar to SummaryTable
2. It will not use filtering or complex chart settings
3. It will focus on displaying and managing color scales
4. The component will be self-contained and reusable
5. It will maintain consistency with existing chart patterns
