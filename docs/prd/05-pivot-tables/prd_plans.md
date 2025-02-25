# Summary table improvements

Overall goal is to add a "chart" comp type for calculating and viewing pivot tables.

## Requirements

- Add a new chart type for pivot tables
- Core settings + selectors
  - Row fields - multi select on the field names
  - Column fields - multi select on the field names
  - Value fields - define a list of field + agg functions to calculate
  - Agg functions - sum, count, avg, min, max, median, mode, stddev, variance, count unique, single value
  - Special agg function = derived value - allows the user to enter a formula that uses the already computed agg values as variables
- Add logic to gather the data and perform the calcs
- If choosing single value, throw an error if there is more than one unique value
- Add a new pivot table button to all categorical field types in the summary table
  - This will create a simple table that only has a single row field defined
- Build the visuals for the pivot table - they should basically match Excel
- Add logic to the row and column headers which allows the user to filter the data - click to filter on value
- UX considerations
  - Allow user to drag a field from the summary table to the pivot table to use as a row field or column field
  - Allow user to click on a pivot value and get a detailed listing of the rows that contributed to that value

### Date Field Handling

- Support automatic date field binning with options:
  - Day
  - Month
  - Year
- Implement internal handling of date buckets
- Integrate with the calculation engine

### Totals and Subtotals

- Support row and column subtotals
- Support grand totals
- Make totals display optional

### Drill-down Features

- Implement modal/popover interface for detailed data view
- Add pagination support for detailed data views

### Calculated Fields

- Support calculated expressions based on existing pivot table values
- Implement custom syntax for calculations

### Data Export

- Add export to CSV functionality
- Integrate with global view system for saving configurations

## Plan

## Implementation Plan

### Component Structure

```
src/
  components/
    pivot-table/
      PivotTable.tsx         # Main pivot table component
      PivotTableConfig.tsx   # Configuration panel
      PivotTableHeader.tsx   # Header with filtering
      PivotTableBody.tsx     # Table body with data
      PivotTableCell.tsx     # Individual cell component
      types.ts              # Type definitions
      utils/
        calculations.ts     # Aggregation functions
        dateHandling.ts    # Date binning logic
        filtering.ts       # Filter implementations
```

### Interface Details

```typescript
interface PivotTableConfig {
  rowFields: string[];
  columnFields: string[];
  valueFields: ValueFieldConfig[];
  showTotals: {
    row: boolean;
    column: boolean;
    grand: boolean;
  };
  dateBinning?: {
    field: string;
    type: "day" | "month" | "year";
  };
}

interface ValueFieldConfig {
  field: string;
  aggregation: AggregationType;
  formula?: string; // For derived values
}

type AggregationType =
  | "sum"
  | "count"
  | "avg"
  | "min"
  | "max"
  | "median"
  | "mode"
  | "stddev"
  | "variance"
  | "countUnique"
  | "singleValue";
```

### Implementation Phases

1. Core Components and Data Structure

   - Set up basic component structure
   - Implement data transformation logic
   - Create configuration panel with field selectors

2. Calculation Engine

   - Implement core aggregation functions
   - Add date binning support
   - Build formula parser for derived values

3. UI and Interactions

   - Build table layout with headers and cells
   - Add filtering interactions
   - Implement drag-and-drop field assignment

4. Advanced Features

   - Add totals and subtotals
   - Implement drill-down modal
   - Add export functionality

5. Polish and Optimization
   - Performance optimizations
   - UI refinements
   - Testing and bug fixes

## Status

### Phase 1: Core Components

- [ ] Basic component structure

  - [ ] Create component files
  - [ ] Set up types and interfaces
  - [ ] Add basic styling with Tailwind

- [ ] Configuration Panel

  - [ ] Field selector components
  - [ ] Aggregation type selector
  - [ ] Date binning options

- [ ] Data Transformation
  - [ ] Core data processing logic
  - [ ] Basic aggregation implementation
  - [ ] Data structure optimization

### Phase 2: Calculation Engine

- [ ] Aggregation Functions

  - [ ] Basic calculations (sum, count, avg)
  - [ ] Statistical functions
  - [ ] Single value validation

- [ ] Date Handling

  - [ ] Date binning implementation
  - [ ] Date format utilities
  - [ ] Bucket calculations

- [ ] Formula System
  - [ ] Formula parser
  - [ ] Variable resolution
  - [ ] Error handling

### Phase 3: UI Implementation

- [ ] Table Layout

  - [ ] Header components
  - [ ] Cell components
  - [ ] Responsive design

- [ ] Interactions

  - [ ] Click-to-filter
  - [ ] Drag-and-drop
  - [ ] Column/row resizing

- [ ] Drill-down Features
  - [ ] Detail view modal
  - [ ] Data pagination
  - [ ] Filtering options

### Phase 4: Advanced Features

- [ ] Totals System

  - [ ] Row subtotals
  - [ ] Column subtotals
  - [ ] Grand totals

- [ ] Export Features
  - [ ] CSV export
  - [ ] Configuration saving
  - [ ] Data formatting

### Phase 5: Polish

- [ ] Performance

  - [ ] Memoization
  - [ ] Lazy loading
  - [ ] Virtual scrolling

- [ ] Testing
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] Performance testing

## Current Progress

- Initial PRD created
- Requirements gathered
- Component structure planned

### Next Steps

1. Set up initial component structure
2. Implement basic configuration panel
3. Create core data transformation logic
4. Build basic table layout
5. Add simple aggregation functions
6. Implement date binning
7. Add filtering capabilities
8. Create drill-down modal
9. Implement totals system
10. Add export functionality
11. Optimize performance
12. Add comprehensive testing
