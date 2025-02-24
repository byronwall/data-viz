# Summary Table Implementation Plan

## Overview

The summary table feature will provide users with an immediate understanding of their data by analyzing and displaying key statistics for each column.

## Current State Analysis

The application currently has:

- CSV file upload functionality using PapaParse
- Data storage using Zustand state management
- Crossfilter2 for data manipulation
- Basic data display capabilities
- React and TypeScript foundation
- Tailwind CSS and shadcn/ui for styling

## Technical Architecture

### 1. Core Interfaces

#### Column Summary Interface

```typescript
interface ColumnSummary {
  name: string;
  dataType: "numeric" | "categorical" | "datetime" | "boolean";
  totalCount: number;
  uniqueCount: number;
  nullCount: number;
  statistics?: NumericStatistics;
  categories?: CategoryStatistics;
}

interface NumericStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
}

interface CategoryStatistics {
  topValues: Array<{ value: string; count: number }>;
  distribution: Record<string, number>;
}
```

### 2. Component Architecture

```
SummaryTable/
├── components/
│   ├── SummaryTable.tsx
│   ├── ColumnTypeIcon.tsx
│   ├── StatisticCell.tsx
│   └── CreateChartButton.tsx
├── hooks/
│   ├── useColumnAnalysis.ts
│   └── useSampledData.ts
└── utils/
    ├── dataTypeDetection.ts
    ├── statisticsCalculator.ts
    └── samplingStrategy.ts
```

### 3. Component Interfaces

#### SummaryTable.tsx

```typescript
interface SummaryTableProps {
  data: DatumObject[];
  onCreateChart: (columnName: string, chartType: string) => void;
  sampleSize?: number;
}
```

#### ColumnTypeIcon.tsx

```typescript
interface ColumnTypeIconProps {
  type: "numeric" | "categorical" | "datetime" | "boolean";
  hasNulls: boolean;
  uniqueValueCount: number;
}
```

#### CreateChartButton.tsx

```typescript
interface CreateChartButtonProps {
  columnName: string;
  dataType: string;
  onCreateChart: (type: string) => void;
}
```

## Implementation Phases

### Phase 1: Core Data Analysis

1. Data Type Detection

   - Implement heuristics for type detection
   - Handle edge cases and mixed data types
   - Add unit tests for type detection

2. Statistics Calculation

   - Basic numeric statistics (min, max, mean, etc.)
   - Categorical data analysis
   - Null/undefined detection
   - Performance optimization for large datasets

3. Data Sampling
   - Smart sampling strategy implementation
   - Sample size configuration
   - Statistical significance assurance

### Phase 2: UI Development

1. Base SummaryTable Component

   - Responsive grid layout
   - Column type icons
   - Basic statistics display

2. Interactive Features

   - Sorting capabilities
   - Filtering options
   - Column type override controls

3. Chart Creation Integration
   - Context-aware chart suggestions
   - Quick chart creation workflow
   - Integration with existing chart system

### Phase 3: Performance Optimization

1. Progressive Loading

   - Lazy calculation of statistics
   - Cached results storage
   - Background processing for large datasets

2. Memory Management
   - Efficient data structures
   - Cleanup mechanisms
   - Memory usage monitoring

### Phase 4: Polish & Integration

1. Visual Feedback

   - Loading states
   - Error handling
   - Success indicators

2. Sampling Controls

   - Sample size adjustment
   - Full dataset processing option
   - Progress indicators

3. Export Features
   - Statistics export
   - Report generation
   - Integration with project saving

## Technical Implementation Details

### Data Processing Layer

#### Type Detection

```typescript
export type DataType = "numeric" | "categorical" | "datetime" | "boolean";

interface TypeDetectionResult {
  type: DataType;
  confidence: number;
  sampleSize: number;
}

interface TypeDetectionOptions {
  sampleSize?: number;
  dateFormats?: string[];
  forceString?: boolean;
}
```

#### Statistics Calculator

```typescript
export interface NumericStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  quartiles: [number, number, number];
  outliers: number[];
}

export interface CategoryStats {
  uniqueValues: Set<datum>;
  frequencies: Map<datum, number>;
  mode: datum;
  entropy: number;
}

export interface DateTimeStats {
  min: Date;
  max: Date;
  range: number;
  frequencies: Map<string, number>;
}
```

#### Data Sampling

```typescript
export interface SamplingOptions {
  sampleSize: number;
  method: "random" | "systematic" | "stratified";
  seed?: number;
}

export interface StratifiedSamplingConfig {
  stratifyBy: string;
  proportions: Map<string, number>;
}
```

### UI Layer

#### Summary Table State

```typescript
interface SummaryTableState {
  columns: ColumnSummary[];
  sampledData: boolean;
  processingStatus: Map<string, "pending" | "complete" | "error">;
}
```

#### Analysis Hooks

```typescript
interface AnalysisOptions {
  sampleSize?: number;
  forceString?: boolean;
  cacheResults?: boolean;
}

interface AnalysisResult {
  columnSummaries: Map<string, ColumnSummary>;
  dataQuality: {
    completeness: number;
    consistency: number;
    accuracy: number;
  };
  correlations?: Map<string, Map<string, number>>;
}

interface SamplingConfig extends SamplingOptions {
  refreshInterval?: number;
  cacheKey?: string;
}

interface SampledDataState {
  sample: DatumObject[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date;
}
```
