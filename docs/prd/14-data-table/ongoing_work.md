# Data Table Implementation Plan

## Phase 0: Remove Grouping

- [x] Remove grouping from the data table
- [x] Update the data table to not expect grouping
- [x] Update settings related to grouping
- [x] Remove any comps that are related to grouping

## Phase 1: Pagination and Basic Functionality

### Fix Pagination

- [x] Update pagination logic to handle data correctly
  - [x] Modify data processing to count all items
  - [x] Update pagination calculations
  - [x] Add tests for pagination

## Phase 2: Row Selection and Multi-select

### Row Selection Implementation

- [ ] Fix infinite re-render issue with row selection
  - [ ] Review and fix state management for selected rows
  - [ ] Implement proper memoization
  - [ ] Add tests for row selection
- [ ] Implement multi-select drag reordering
  - [ ] Add drag-and-drop functionality for selected rows
  - [ ] Update selection state during reordering
  - [ ] Add tests for drag reordering

## Phase 3: Data Processing and Search

### Sorting Improvements

- [ ] Implement numeric sorting
  - [ ] Add natural sort for numeric columns
  - [ ] Update column sorting logic
  - [ ] Add tests for numeric sorting

### Search Functionality

- [ ] Fix global search
  - [ ] Review and fix search implementation
  - [ ] Add tests for search functionality

## Phase 4: UI and Layout

### Layout Improvements

- [ ] Implement proper height and overflow handling
  - [ ] Add fixed height container
  - [ ] Implement proper scrolling behavior
- [ ] Allow column resizing with a simple handler - store column widths in settings
- [ ] Add a proper column header to the table - or use the existing column header

### Settings Integration

- [x] Move settings into main tab
  - [x] Integrate settings UI into main view
  - [x] Remove settings related to specific columns: `type`, `label`, `width`, `sortable`, `filterable`
  - [x] Do not expose an input for column width - controlled by the UI

## Phase 5: Code Organization and Testing

### Testing Infrastructure

- [ ] Update test configuration
  - [ ] Update cursor rules for Vitest
  - [ ] Add missing Vitest imports
  - [ ] Review and update existing tests

## Status

### Current Progress

- Initial implementation complete
- Issues identified during testing
- Plan created to address all identified issues

### Next Steps

1. Begin work on pagination
2. Implement proper row selection
3. Fix search functionality
4. Address remaining UI and layout issues
5. Update testing infrastructure

### Outstanding Questions

- Should data access be standardized through props instead of hooks?
- How should selected rows state be managed?
- What is the best approach for settings integration?
