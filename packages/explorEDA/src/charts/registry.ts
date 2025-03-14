import { barChartDefinition } from "@/components/charts/BarChart/definition";
import { scatterPlotDefinition } from "@/components/charts/ScatterPlot/definition";
import { threeDScatterDefinition } from "@/components/charts/ThreeDScatter/definition";
import { pivotTableDefinition } from "@/components/charts/PivotTable/definition";
import { dataTableDefinition } from "@/components/charts/DataTable/definition";
import { summaryTableDefinition } from "@/components/charts/SummaryTable/definition";
import { markdownDefinition } from "@/components/charts/Markdown/definition";
import { boxPlotDefinition } from "@/components/charts/BoxPlot/definition";
import { colorLegendDefinition } from "@/components/charts/ColorLegend/definition";
import { lineChartDefinition } from "@/components/charts/LineChart/definition";
import {
  BaseChartSettings,
  ChartDefinition,
  ChartSettings,
} from "@/types/ChartTypes";
import { rowChartDefinition } from "../components/charts/RowChart/definition";

type ChartType = string;

export interface ChartRegistry {
  register<TSettings extends BaseChartSettings>(
    definition: ChartDefinition<TSettings>
  ): void;
  get(type: ChartType): ChartDefinition<ChartSettings> | undefined;
  getAll(): ChartDefinition<ChartSettings>[];
  has(type: ChartType): boolean;
}

export class ChartRegistryImpl implements ChartRegistry {
  private definitions = new Map<ChartType, ChartDefinition<ChartSettings>>();

  register<TSettings extends BaseChartSettings>(
    definition: ChartDefinition<TSettings>
  ): void {
    if (this.definitions.has(definition.type)) {
      console.error(`Chart type ${definition.type} is already registered`);
      return;
    }
    this.definitions.set(
      definition.type,
      definition as unknown as ChartDefinition<ChartSettings>
    );
  }

  get(type: ChartType): ChartDefinition<ChartSettings> | undefined {
    return this.definitions.get(type);
  }

  getAll(): ChartDefinition<ChartSettings>[] {
    return Array.from(this.definitions.values());
  }

  has(type: ChartType): boolean {
    return this.definitions.has(type);
  }
}

// Singleton instance
export const chartRegistry = new ChartRegistryImpl();

// Helper functions
export function registerChart<TSettings extends BaseChartSettings>(
  definition: ChartDefinition<TSettings>
): void {
  chartRegistry.register(definition);
}

export function getChartDefinition(
  type: ChartType
): ChartDefinition<ChartSettings> {
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
  chartRegistry.register(threeDScatterDefinition);
  chartRegistry.register(pivotTableDefinition);
  chartRegistry.register(dataTableDefinition);
  chartRegistry.register(summaryTableDefinition);
  chartRegistry.register(markdownDefinition);
  chartRegistry.register(boxPlotDefinition);
  chartRegistry.register(colorLegendDefinition);
  chartRegistry.register(lineChartDefinition);
}
