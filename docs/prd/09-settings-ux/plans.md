# Settings UX Implementation Plan

## Component Architecture

### TabContainer Component

- Main wrapper for all settings tabs
- Handles tab state and switching
- Uses shadcn Tabs component
- Props:
  - `activeTab: string`
  - `onTabChange: (tab: string) => void`

### SettingsTab Components

1. MainSettingsTab

   - Core settings
   - Chart-type specific critical settings
   - Props:
     - `chartType: ChartType`
     - `settings: ChartSettings`
     - `onSettingChange: (key: string, value: any) => void`

2. AxisSettingsTab

   - X and Y axis configurations
   - Scale settings
   - Props:
     - `axisSettings: AxisSettings`
     - `onAxisSettingChange: (axis: 'x' | 'y', key: string, value: any) => void`

3. FacetSettingsTab

   - Faceting configuration
   - Grid layout settings
   - Props:
     - `facetSettings: FacetSettings`
     - `onFacetSettingChange: (key: string, value: any) => void`

4. AdvancedSettingsTab
   - All remaining settings
   - Props:
     - `advancedSettings: AdvancedSettings`
     - `onAdvancedSettingChange: (key: string, value: any) => void`

### NumericInputEnter Component

- Enhanced numeric input with keyboard controls
- Props:
  - `value: number`
  - `onChange: (value: number) => void`
  - `stepSmall?: number` (default: 1)
  - `stepMedium?: number` (default: 10)
  - `stepLarge?: number` (default: 100)
  - `min?: number`
  - `max?: number`
  - `placeholder?: string`

## Implementation Phases

### Phase 1: Core Components

1. Create NumericInputEnter component

   - Basic input functionality
   - Keyboard controls implementation
   - Unit tests for keyboard interactions

2. Implement base TabContainer
   - Tab structure using shadcn
   - State management
   - Responsive layout

### Phase 2: Settings Tabs

1. MainSettingsTab implementation

   - Core settings layout
   - Chart-type specific settings
   - Form validation

2. AxisSettingsTab implementation

   - Axis configuration forms
   - Scale settings integration

3. FacetSettingsTab implementation

   - Faceting options
   - Grid layout controls

4. AdvancedSettingsTab implementation
   - Remaining settings organization
   - Advanced options layout

### Phase 3: Integration & Polish

1. Settings state management

   - Default values handling
   - Changed values tracking
   - State persistence

2. UI/UX Improvements

   - Form layout optimization
   - Label positioning
   - Responsive design refinements

3. Non-default settings view
   - Changed settings highlighting
   - Filter/toggle for modified settings

## Status

### Phase 1: Core Components

- [ ] NumericInputEnter Component

  - [ ] Basic input structure
  - [ ] Keyboard controls
  - [ ] Unit tests
  - [ ] Integration with existing forms

- [ ] TabContainer Implementation
  - [ ] Basic tab structure
  - [ ] State management
  - [ ] Responsive layout
  - [ ] Integration with settings panels

### Phase 2: Settings Tabs

- [ ] MainSettingsTab

  - [ ] Component structure
  - [ ] Core settings implementation
  - [ ] Chart-type specific settings
  - [ ] Form validation

- [ ] AxisSettingsTab

  - [ ] Component structure
  - [ ] Axis configuration forms
  - [ ] Scale settings

- [ ] FacetSettingsTab

  - [ ] Component structure
  - [ ] Faceting options
  - [ ] Grid controls

- [ ] AdvancedSettingsTab
  - [ ] Component structure
  - [ ] Advanced settings organization
  - [ ] Layout optimization

### Phase 3: Integration & Polish

- [ ] Settings State Management

  - [ ] Default values system
  - [ ] Change tracking
  - [ ] State persistence

- [ ] UI/UX Refinements

  - [ ] Form layout improvements
  - [ ] Label positioning
  - [ ] Responsive design

- [ ] Non-default Settings View
  - [ ] Changed settings tracking
  - [ ] Filter implementation
  - [ ] UI for modified settings

## Current Progress

- Initial requirements gathering completed
- Component architecture defined
- Implementation plan created

## Next Steps

1. Begin NumericInputEnter component implementation
2. Set up TabContainer base structure
3. Create initial MainSettingsTab implementation
4. Implement settings state management
5. Continue with remaining tabs implementation
6. Add UI polish and refinements
7. Implement non-default settings view
