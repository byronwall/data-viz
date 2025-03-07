# Chart Definition Rework Implementation Plan

## Core Types

```typescript
interface ChartDefinition<TSettings extends BaseChartSettings = ChartSettings> {
  // Metadata
  type: ChartType;
  name: string;
  description: string;
  icon: LucideIcon;

  // Component References
  component: React.ComponentType<BaseChartProps>;
  settingsPanel: React.ComponentType<ChartSettingsPanelProps>;

  // Settings Management
  createDefaultSettings: () => TSettings;
  validateSettings: (settings: TSettings) => boolean;

  // Filtering
  filterData: (data: any[], filters: Filter) => any[];
  createFilterFromSelection: (selection: any, settings: TSettings) => Filter;
}
```

## Registry Implementation

```typescript
// src/charts/registry.ts
export class ChartRegistryImpl implements ChartRegistry {
  private definitions = new Map<ChartType, ChartDefinition>();

  register(definition: ChartDefinition): void {
    if (this.definitions.has(definition.type)) {
      throw new Error(`Chart type ${definition.type} is already registered`);
    }
    this.definitions.set(definition.type, definition);
  }

  get(type: ChartType): ChartDefinition | undefined {
    return this.definitions.get(type);
  }

  getAll(): ChartDefinition[] {
    return Array.from(this.definitions.values());
  }

  has(type: ChartType): boolean {
    return this.definitions.has(type);
  }
}

// Singleton instance
export const chartRegistry = new ChartRegistryImpl();

// Helper functions
export function registerChart(definition: ChartDefinition): void {
  chartRegistry.register(definition);
}

export function getChartDefinition(type: ChartType): ChartDefinition {
  const def = chartRegistry.get(type);
  if (!def) {
    throw new Error(`Chart type ${type} not registered`);
  }
  return def;
}

// React context for registry access
export const ChartRegistryContext =
  React.createContext<ChartRegistry>(chartRegistry);

export function useChartRegistry() {
  return useContext(ChartRegistryContext);
}

export function useChartDefinition(type: ChartType) {
  const registry = useChartRegistry();
  const definition = registry.get(type);

  if (!definition) {
    throw new Error(`Chart type ${type} not registered`);
  }

  return definition;
}
```

## Implementation Plan

### Phase 1: Core Infrastructure

- [ ] Create base chart registry system

  - [ ] Implement `ChartDefinition` interface
  - [ ] Create registry class with `Map<ChartType, ChartDefinition>`
  - [ ] Add registration and lookup methods
  - [ ] Add type safety and validation

- [ ] Set up file structure
  - [ ] Create `/src/charts` directory
  - [ ] Add `/src/charts/registry.ts`
  - [ ] Add `/src/charts/types.ts`
  - [ ] Create `/src/charts/utils` for shared utilities
  - [ ] Create template structure for individual chart folders

### Phase 2: Core Components Update

- [ ] Update `ChartRenderer` to use registry

  - [ ] Remove switch statements
  - [ ] Add error boundaries
  - [ ] Handle async transformations

- [ ] Update `ChartSettingsPanel` to use registry

  - [ ] Remove switch statements
  - [ ] Add validation handling
  - [ ] Support dynamic features

- [ ] Update `DataLayerProvider` integration
  - [ ] Modify chart operations to use registry
  - [ ] Add support for async transformations
  - [ ] Handle progressive loading

### Phase 3: Utilities and Shared Functions

- [ ] Create transform pipeline utilities

  - [ ] Implement `composeTransforms` helper
  - [ ] Add common transform functions
  - [ ] Support async transforms

- [ ] Create filter utilities

  - [ ] Implement filter composition
  - [ ] Add common filter predicates
  - [ ] Support complex filter types

- [ ] Add shared chart utilities
  - [ ] Color scale helpers
  - [ ] Axis configuration helpers
  - [ ] Data binning utilities
  - [ ] Faceting helpers

### Phase 4: Chart Implementation Framework

- [ ] Create base chart implementation template

  - [ ] Define folder structure
  - [ ] Create type templates
  - [ ] Add documentation

- [ ] Implement chart migration process
  - [ ] Document migration steps
  - [ ] Create migration utilities
  - [ ] Add validation helpers

### Phase 5: Chart Implementations

- [ ] Bar Chart Implementation
- [ ] Row Chart Implementation
- [ ] Scatter Plot Implementation
- [ ] 3D Scatter Plot Implementation
- [ ] Pivot Table Implementation
- [ ] Summary Table Implementation
- [ ] Data Table Implementation

## Status

### Phase 1: Core Infrastructure

- [ ] Create base chart registry system
  - [ ] Implement `ChartDefinition` interface
  - [ ] Create registry class
  - [ ] Add registration methods
  - [ ] Add type safety

### Current Progress

- Initial plan created
- Core types defined

### Next Steps

- Begin Phase 1 implementation
- Set up core file structure
- Implement base registry system
