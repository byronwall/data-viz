import { barChartDefinition } from "@/components/charts/BarChart/definition";
import { chartRegistry } from "./registry";
import { rowChartDefinition } from "./row";

export function registerAllCharts() {
  chartRegistry.register(rowChartDefinition);
  chartRegistry.register(barChartDefinition);
}
