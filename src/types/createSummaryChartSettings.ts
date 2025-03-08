import { getChartDefinition } from "@/charts/registry";
import { SummaryChartSettings, ChartLayout } from "./ChartTypes";

export function createSummaryChartSettings(
  layout: ChartLayout
): SummaryChartSettings {
  const definition = getChartDefinition("summary");
  return definition.createDefaultSettings(layout) as SummaryChartSettings;
}
