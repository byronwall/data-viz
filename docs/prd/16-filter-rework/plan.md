# Plan: Rework Chart Filters System

## Current Issues

1. Different chart types handle filters differently:
   - Row charts use `filterValues`
   - Bar charts use both `filterValues` and `filterRange`
   - Scatter charts use `xFilterRange` and `yFilterRange`
   - Data tables use a more sophisticated filter object
2. Filter logic is scattered across multiple files
3. Switch statements in `getFilterValues.ts` make the code hard to maintain

## Proposed Solution

### 1. Create Unified Filter Type System

```typescript
interface FilterBase {
  type: string;
  field: string;
}

interface ValueFilter extends FilterBase {
  type: "value";
  values: Array<string | number>;
}

interface RangeFilter extends FilterBase {
  type: "range";
  min?: number;
  max?: number;
}

interface TextFilter extends FilterBase {
  type: "text";
  operator: "contains" | "equals" | "startsWith" | "endsWith";
  value: string;
}

type Filter = ValueFilter | RangeFilter | TextFilter;

interface ChartFilters {
  filters: Filter[];
}

// Example: Scatter Chart Filter Configuration
interface ScatterChartSettings extends BaseChartSettings {
  type: "scatter";
  xField: string;
  yField: string;
  filters: Filter[]; // Will contain two RangeFilter objects, one for each axis
}

// Example scatter chart filter usage:
const scatterFilters = [
  {
    type: "range",
    field: "x_field_name",
    min: 0,
    max: 100,
  },
  {
    type: "range",
    field: "y_field_name",
    min: 20,
    max: 80,
  },
];
```

### 2. Migration Steps

1. Create new types in `src/types/ChartTypes.ts`
2. Update each chart's settings interface to use the new `ChartFilters` interface
3. Update filter-related hooks:
   - Replace `getFilterValues.ts` with new filter management system
   - Create new hooks for common filter operations

### 3. New Filter Management System

1. Create `src/hooks/useFilters.ts`:

   - Handle all filter operations
   - Provide consistent API for all chart types
   - Include type-safe filter manipulation functions

2. Create filter utility functions:
   - `createFilter(type, field, ...params)`
   - `applyFilter(data, filter)`
   - `combineFilters(filters[])`

### 3.1 Scatter Chart Filter Specifics

1. Scatter charts will store two `RangeFilter` objects in their `filters` array
2. The `field` property will match the chart's `xField` and `yField` settings
3. Helper functions for scatter charts:
   - `getXFilter(filters: Filter[]): RangeFilter`
   - `getYFilter(filters: Filter[]): RangeFilter`
   - `updateXFilter(filters: Filter[], min?: number, max?: number): Filter[]`
   - `updateYFilter(filters: Filter[], min?: number, max?: number): Filter[]`

### 4. Implementation Order

1. Create new type system
2. Implement core filter utilities
3. Update chart types one at a time:
   - Row Chart (simplest case)
   - Bar Chart
   - Scatter Chart
   - Data Table (most complex case)
4. Remove old filter code
5. Update documentation

## Detailed Execution Plan

### 1. Core Infrastructure (Week 1)

#### Update ChartTypes.ts

```typescript
// Add new filter types
interface FilterBase {
  type: string;
  field: string;
}

interface ValueFilter extends FilterBase {
  type: "value";
  values: Array<string | number>;
}

interface RangeFilter extends FilterBase {
  type: "range";
  min?: number;
  max?: number;
}

interface TextFilter extends FilterBase {
  type: "text";
  operator: "contains" | "equals" | "startsWith" | "endsWith";
  value: string;
}

type Filter = ValueFilter | RangeFilter | TextFilter;
```

#### Create useFilters.ts

```typescript
// Core filter utilities
export const createFilter = (
  type: string,
  field: string,
  params: any
): Filter => {
  // Implementation
};

export const applyFilter = (data: any[], filter: Filter): any[] => {
  // Implementation
};

export const combineFilters = (filters: Filter[]): Filter => {
  // Implementation
};

// Chart-specific helpers
export const getAxisFilter = (
  filters: Filter[],
  field: string
): RangeFilter | undefined => {
  // Implementation
};

export const updateAxisFilter = (
  filters: Filter[],
  field: string,
  min?: number,
  max?: number
): Filter[] => {
  // Implementation
};
```

### 2. Chart Migration (Week 2-4)

#### Update Chart Settings Interfaces

1. ScatterChartSettings:

```typescript
interface ScatterChartSettings extends BaseChartSettings {
  type: "scatter";
  xField: string;
  yField: string;
  filters: Filter[]; // Replace xFilterRange and yFilterRange
}
```

2. RowChartSettings:

```typescript
interface RowChartSettings extends BaseChartSettings {
  type: "row";
  minRowHeight: number;
  maxRowHeight: number;
  filters: Filter[]; // Replace filterValues
}
```

3. BarChartSettings:

```typescript
interface BarChartSettings extends BaseChartSettings {
  type: "bar";
  filters: Filter[]; // Replace filterValues and filterRange
}
```

### 4. Key Files to Modify

1. `src/types/ChartTypes.ts`

   - Add new filter types
   - Update chart settings interfaces
   - Remove old filter types

2. `src/hooks/getFilterValues.ts`

   - Eventually remove this file
   - Migrate functionality to new filter system

3. Chart Definition Files:

   - Update each chart's `definition.ts`
   - Modify `getFilterFunction`
   - Update settings validation

4. Components:
   - Update filter UI components
   - Modify filter handling logic
   - Update prop types

### 5. Testing Plan

1. Unit Tests:

   - Filter creation utilities
   - Filter application functions
   - Migration functions

2. Integration Tests:

   - Chart-specific filter behavior
   - Filter UI interaction
   - Data flow through filters

### 6. Timeline

1. Week 1: Core Infrastructure

   - Set up new types
   - Create filter utilities
   - Initial testing framework

2. Week 2: Basic Charts

   - Migrate Row Chart
   - Migrate Bar Chart
   - Update basic components

3. Week 3: Complex Charts

   - Migrate Scatter Chart
   - Begin Data Table migration
   - Integration testing

4. Week 4: Cleanup and Polish
   - Complete Data Table migration
   - Remove old code
   - Documentation
   - Final testing
