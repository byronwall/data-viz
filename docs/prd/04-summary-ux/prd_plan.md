# Summary table improvements

Overall goal is to reduce the size of the table so it can appear in a left sidebar that is easily collapsed.

## Requirements

- Add a left sidebar that is displayed by default - collapse when icon is clicked
- Move the summary table into the sidebar
- Adorn the right side with the main charting interface
- Reduce the width of the table via
  - Show icon for data type instead of word
  - Show the unique count instead of the total count - show total in tooltip
  - If there are any nulls, show an icon, show null count in tooltip
  - Put the stats in badges with simple icons for min max and most common values

## Implementation Plan

### Phase 1: Sidebar Component

#### Components

- `components/layout/Sidebar.tsx`

  ```typescript
  interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }
  ```

- `components/layout/MainLayout.tsx`

  ```typescript
  interface MainLayoutProps {
    children: React.ReactNode;
  }
  ```

#### Actions

1. Create responsive sidebar layout
2. Add collapse/expand functionality
3. Implement smooth transitions
4. Add resize handle for width adjustment

### Phase 2: Table Redesign

#### Components

- `components/SummaryTable/CompactSummaryTable.tsx`

  ```typescript
  interface CompactSummaryTableProps {
    data: ColumnSummary[];
    onSort: (column: string) => void;
    onChartCreate: (column: string) => void;
  }
  ```

#### Actions

1. Create data type icons for each type
2. Implement compact row design
3. Add tooltips for expanded information
4. Update sorting mechanism for new layout

### Phase 3: Stats Display

#### Components

- `components/SummaryTable/StatBadge.tsx`

  ```typescript
  interface StatBadgeProps {
    type: "min" | "max" | "common";
    value: string | number;
    icon: LucideIcon;
  }
  ```

#### Actions

1. Design compact stat badges
2. Add appropriate icons for each stat type
3. Implement tooltips for detailed stats
4. Create hover interactions

### Phase 4: Integration

#### Actions

1. Move existing table into sidebar
2. Update main content area layout
3. Implement responsive behavior
4. Add performance optimizations
5. Test and refine interactions

## Status

### Phase 1: Sidebar Component

- [ ] Basic sidebar structure
  - [ ] Component scaffolding
  - [ ] Basic styling
  - [ ] Responsive layout
- [ ] Collapse functionality
  - [ ] Toggle button
  - [ ] Animation
  - [ ] State management
- [ ] Resize functionality
  - [ ] Drag handle
  - [ ] Width constraints
  - [ ] Persistence

### Phase 2: Table Redesign

- [ ] Data type display
  - [ ] Icon selection
  - [ ] Icon component
  - [ ] Type mapping
- [ ] Compact layout
  - [ ] Row design
  - [ ] Column layout
  - [ ] Spacing optimization
- [ ] Information display
  - [ ] Tooltip components
  - [ ] Hover states
  - [ ] Interactive elements

### Phase 3: Stats Display

- [ ] Badge components
  - [ ] Base badge design
  - [ ] Icon integration
  - [ ] Variant styles
- [ ] Stats formatting
  - [ ] Number formatting
  - [ ] Text truncation
  - [ ] Tooltip content
- [ ] Interactive features
  - [ ] Hover states
  - [ ] Click actions
  - [ ] Keyboard navigation

### Phase 4: Integration

- [ ] Layout integration
  - [ ] Component composition
  - [ ] State management
  - [ ] Event handling
- [ ] Performance
  - [ ] Load optimization
  - [ ] Render efficiency
  - [ ] Memory management
- [ ] Testing
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] Performance tests

### Current Progress

All phases are currently in planning stage with no implementation work started. The next step is to begin Phase 1 with the sidebar component implementation.
