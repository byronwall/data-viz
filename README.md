# Data Viz

Tool for exploratory and interactive data analysis.

![](docs/main-image.png)

## Features

### Chart Types

#### Data Tables

- **Data Table**: Interactive data table with sorting, filtering, and pagination
- **Pivot Table**: Interactive pivot table for data analysis with row/column aggregations and totals
- **Summary Table**: Display summary statistics for your data

#### Basic Charts

- **Bar Chart**: Display data as vertical bars with automatic binning for numerical data
- **Row Chart**: Horizontal bar chart showing values by category
- **Line Chart**: Display data as connected points over time or sequence with multiple series support
- **Scatter Plot**: Display data as points in a 2D space
- **Box Plot**: Display distribution of values with quartiles and outliers, with optional violin and bee swarm overlays

#### Advanced Visualizations

- **3D Scatter Plot**: Display data as points in a 3D space with interactive camera controls

#### Documentation and Annotations

- **Color Legend**: Display and manage color scales used in visualizations
- **Markdown**: Rich text content editor for documentation and annotations

### Common Features Across Charts

- Interactive brushing and filtering
- Faceted views with synchronized axes
- Color scale management
- Customizable axes and grid lines
- Responsive layouts
- Tooltips and hover interactions
- Export capabilities

### Data Analysis Features

- Real-time filtering and updates
- Multiple aggregation methods
- Date binning and formatting
- Statistical computations
- Dynamic data loading
- Cross-chart filtering

### User Interface

- Modern, responsive design using Tailwind CSS
- Customizable layouts and chart sizes
- Dark/light theme support
- Intuitive controls and settings panels

### Calculations

- Can create new columns based on existing columns

## Component Structure

![](docs/component_structure.svg)

## Chart Creation Process

The application uses a centralized chart registry system to manage all available chart types. This makes it easy to add new charts by registering them in a single location. Each chart is defined by implementing the `ChartDefinition` interface:

```typescript
interface ChartDefinition<TSettings> {
  // Metadata
  type: string; // Unique identifier for the chart type
  name: string; // Display name
  description: string; // Chart description
  icon: React.ComponentType; // Icon component for the chart

  // Core Components
  component: React.ComponentType; // The main chart component
  settingsPanel: React.ComponentType; // Settings panel for the chart

  // Settings Management
  createDefaultSettings: (layout, field?) => TSettings; // Creates default settings
  validateSettings: (settings) => boolean; // Validates settings
  getFilterFunction: (settings, fieldGetter) => Function; // Creates filter function
}
```

### Registry System

The chart registry (`registry.ts`) serves as a central hub for:

- Registering new chart types
- Retrieving chart definitions
- Managing chart type validation
- Providing type safety for chart settings

### Key Consumers of the Registry

1. **Chart Creation UI** (`ChartCreationButtons.tsx`)

   - Uses registry to display available chart types
   - Handles chart creation workflow

2. **Chart Rendering** (`ChartRenderer.tsx`)

   - Retrieves chart components for rendering
   - Manages chart-specific settings

3. **Settings Management** (`MainSettingsTab.tsx`)

   - Handles chart configuration
   - Provides settings UI based on chart type

4. **Data Layer** (`DataLayerProvider.tsx`)

   - Manages data filtering and updates
   - Uses chart definitions for data processing

5. **Application Initialization** (`main.tsx`)
   - Registers all available charts on startup

### Adding New Charts

To add a new chart type:

1. Create chart component and settings panel
2. Define chart settings interface
3. Implement `ChartDefinition` interface
4. Register chart in `registerAllCharts()`

This centralized approach ensures:

- Consistent chart implementation
- Type safety across the application
- Easy addition of new chart types
- Maintainable chart management

## Technologies Used

### Core Technologies

- React 19 - Modern UI framework
- TypeScript - Type-safe development
- Vite - Build tool and development server
- pnpm - Fast, disk space efficient package manager

### UI and Styling

- Tailwind CSS - Utility-first CSS framework
- shadcn/ui - High-quality React components built on Radix UI
- Lucide React - Beautiful and consistent icons
- Framer Motion - Animation library
- Sonner - Toast notifications
- React Grid Layout - Responsive grid layout system

### Data Visualization

- D3.js - Low-level visualization primitives
- Three.js - 3D graphics library
- Crossfilter - Fast multidimensional filtering

### State Management and Data Handling

- Zustand - Simple state management
- Zod - Schema validation and parsing
- Immer - Immutable state updates
- Papa Parse - CSV parsing

### Development Tools

- Vitest - Unit testing framework
- ESLint - Code linting
- Prettier - Code formatting

## Samples Datasets

There are a couple of sample datasets in the `src/demos/examples.ts` file.

They include:

- FIFA 24 player data, via <https://www.kaggle.com/datasets/nyagami/fc-24-players-database-and-stats-from-easports?resource=download>
- World Bank population data, via <https://data.worldbank.org/indicator/SP.POP.TOTL>
  - Data converted from wide to long format
- NBA Stats, via <https://www.basketball-reference.com/leagues/NBA_2024_totals.html>

## Inspiration

This tool was heavily inspired by [DC.js](https://dc-js.github.io/dc.js/) and [Crossfilter](https://github.com/crossfilter/crossfilter).

My goal is to built a system that allows for user configurable data analysis.
