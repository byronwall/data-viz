# Detailed Plan

## 1. Data Layer State Additions

### Color Scale Types

```typescript
interface ColorScale {
  id: string;
  name: string;
  type: "numerical" | "categorical";
}

interface NumericalColorScale extends ColorScale {
  type: "numerical";
  palette: string; // d3 color scale name
  min: number;
  max: number;
}

interface CategoricalColorScale extends ColorScale {
  type: "categorical";
  palette: string[]; // array of colors
  mapping: Map<string, string>; // value -> color mapping
}
```

### State Updates

- Add `colorScales: (NumericalColorScale | CategoricalColorScale)[]` to DataLayerState
- Add `activeColorScale?: string` to ChartSettings

## 2. Implementation Steps

### 2.1 Data Layer Provider Updates

1. Add color scale management functions:

   - `addColorScale(scale: Omit<ColorScale, "id">)`
   - `removeColorScale(id: string)`
   - `updateColorScale(id: string, updates: Partial<ColorScale>)`
   - `getColorForValue(scaleId: string, value: datum): string`

2. Add default color scales:
   - Default categorical palette
   - Default numerical scales (viridis, magma, etc.)

### 2.2 Chart Component Updates

1. Base Chart Component:

   - Add color scale selector to chart settings
   - Pass color scale info to child charts

2. Individual Chart Updates:

   - BarChart:

     - Support numerical coloring based on bar value
     - Support categorical coloring based on bar label
     - Update bar fill colors using `getColorForValue`

   - ScatterPlot:

     - Add color field selector to settings
     - Color points based on selected field
     - Support both numerical and categorical coloring

   - RowChart:
     - Update bar colors based on categorical color scale
     - Support custom color mappings

### 2.3 UI Components

1. Color Scale Manager:

   ```typescript
   interface ColorScaleManagerProps {
     onScaleSelect: (scaleId: string) => void;
     activeScaleId?: string;
   }
   ```

   - List all available color scales
   - Show preview of each scale
   - Allow creation of new scales
   - Allow editing existing scales

2. Color Scale Editor:

   ```typescript
   interface ColorScaleEditorProps {
     scale: ColorScale;
     onUpdate: (updates: Partial<ColorScale>) => void;
   }
   ```

   - Edit scale name
   - Choose palette type
   - Set min/max for numerical
   - Edit color mappings for categorical
   - Preview current scale

3. Chart Settings Integration:
   - Add color scale selector to chart settings panel
   - Show appropriate options based on data type
   - Preview colors in settings panel

## 3. Implementation Order

1. Core Infrastructure:

   - Add color scale types and state
   - Implement basic color scale management
   - Add default scales

2. Basic Integration:

   - Update chart settings to include color scale
   - Basic color application in charts
   - Simple color scale selector

3. Advanced Features:

   - Custom color scale creation
   - Color scale editor
   - Advanced chart-specific coloring options

4. Polish:
   - Color previews
   - Scale management UI
   - Performance optimizations

## 4. Technical Considerations

### 4.1 Performance

- Cache color calculations
- Optimize color scale lookups
- Batch color updates

### 4.2 State Management

- Store color scales in project state
- Save/load color scales with views
- Handle color scale references in chart settings

### 4.3 Validation

- Validate color values
- Check for missing mappings
- Handle invalid/missing colors
