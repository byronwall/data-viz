# Box Plot Implementation Plan

## Component Structure

### Core Components

1. `BoxPlot.tsx` - Main component for rendering box plots and variants
2. `BoxPlotSettingsPanel.tsx` - Settings panel component
3. `definition.ts` - Type definitions and chart registration

### Utilities

1. `boxPlotCalculations.ts` - Statistical calculations for quartiles, outliers, etc.

## Type Definitions

```typescript
// definition.ts
import { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import { Filter } from "@/types/FilterTypes";
import { BoxSquare } from "lucide-react";

export interface BoxPlotStyleSettings {
  boxFill: string;
  boxStroke: string;
  boxStrokeWidth: number;
  medianStroke: string;
  medianStrokeWidth: number;
  whiskerStroke: string;
  whiskerStrokeWidth: number;
  outlierSize: number;
  outlierStroke: string;
  outlierFill: string;
}

export interface BoxPlotSettings extends BaseChartSettings {
  type: "boxplot";
  whiskerType: "tukey" | "minmax" | "stdDev";
  showOutliers: boolean;
  violinOverlay: boolean;
  beeSwarmOverlay: boolean;
  styles: BoxPlotStyleSettings;
  filters: Filter[];
}

export const boxPlotDefinition: ChartDefinition<BoxPlotSettings> = {
  type: "boxplot",
  name: "Box Plot",
  description: "Display distribution of values with quartiles and outliers",
  icon: BoxSquare,

  component: BoxPlot,
  settingsPanel: BoxPlotSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    field: field ?? "",
    type: "boxplot",
    title: "Box Plot",
    layout,
    whiskerType: "tukey",
    showOutliers: true,
    violinOverlay: false,
    beeSwarmOverlay: false,
    styles: {
      boxFill: "hsl(217.2 91.2% 59.8%)",
      boxStroke: "black",
      boxStrokeWidth: 1,
      medianStroke: "white",
      medianStrokeWidth: 2,
      whiskerStroke: "black",
      whiskerStrokeWidth: 1,
      outlierSize: 3,
      outlierStroke: "black",
      outlierFill: "none",
    },
    filters: [],
  }),

  validateSettings: (settings) => {
    return !!settings.field;
  },

  getFilterFunction: (settings, fieldGetter) => {
    // Similar to bar chart implementation
  },
};
```

## Implementation Details

### BoxPlot.tsx

```typescript
interface BoxPlotProps extends BaseChartProps<BoxPlotSettings> {}

export function BoxPlot({ settings, width, height, facetIds }: BoxPlotProps) {
  // Core rendering logic
  // Will handle all three variants (basic, violin, bee swarm)
}
```

### boxPlotCalculations.ts

```typescript
interface BoxPlotStats {
  q1: number;
  median: number;
  q3: number;
  iqr: number;
  whiskerLow: number;
  whiskerHigh: number;
  outliers: number[];
}

export function calculateBoxPlotStats(
  data: number[],
  whiskerType: BoxPlotSettings["whiskerType"]
): BoxPlotStats {
  // Statistical calculations
}

export function calculateKernelDensity(
  data: number[],
  bandwidth: number
): [number, number][] {
  // KDE calculation for violin plots
}

export function calculateBeeSwarmPositions(
  data: number[],
  width: number
): [number, number][] {
  // Point positioning for bee swarm overlay
}
```

## Status

### Phase 1: Core Box Plot

- [ ] Type Definitions

  - [ ] Create interfaces in definition.ts
  - [ ] Define style settings
  - [ ] Set up chart registration

- [ ] Statistical Functions
  - [ ] Quartile calculations
  - [ ] Whisker calculations
  - [ ] Outlier detection

### Phase 2: Base Implementation

- [ ] BoxPlot Component
  - [ ] Data processing
  - [ ] Scale generation
  - [ ] Box rendering
  - [ ] Whisker rendering
  - [ ] Outlier rendering
  - [ ] Axis integration
  - [ ] Tooltip support

### Phase 3: Variants

- [ ] Violin Plot Overlay

  - [ ] KDE calculations
  - [ ] Violin shape rendering
  - [ ] Integration with base plot

- [ ] Bee Swarm Overlay
  - [ ] Point positioning algorithm
  - [ ] Point rendering
  - [ ] Integration with base plot

### Phase 4: Settings Panel

- [ ] BoxPlotSettingsPanel
  - [ ] Basic field selection
  - [ ] Whisker type selection
  - [ ] Style controls
  - [ ] Overlay toggles

## Current Progress

- Initial plan created
- Interface definitions drafted

### Next Steps

1. Implement type definitions and chart registration
2. Create statistical calculation utilities
3. Build base box plot component
4. Add violin plot calculations and rendering
5. Add bee swarm calculations and rendering
6. Implement settings panel
7. Add interaction support (tooltips, etc.)
