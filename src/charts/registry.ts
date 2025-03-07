import { barChartDefinition } from "@/components/charts/BarChart/definition";
import { scatterPlotDefinition } from "@/components/charts/ScatterPlot/definition";
import { ChartDefinition, ChartType } from "@/types/ChartTypes";
import { rowChartDefinition } from "./row";

export interface ChartRegistry {
  register(definition: ChartDefinition): void;
  get(type: ChartType): ChartDefinition | undefined;
  getAll(): ChartDefinition[];
  has(type: ChartType): boolean;
}

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

export function useChartDefinition(type: ChartType) {
  const definition = chartRegistry.get(type);

  if (!definition) {
    throw new Error(`Chart type ${type} not registered`);
  }

  return definition;
}

export function registerAllCharts() {
  chartRegistry.register(rowChartDefinition);
  chartRegistry.register(barChartDefinition);
  chartRegistry.register(scatterPlotDefinition);
}
