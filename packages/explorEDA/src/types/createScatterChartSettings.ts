import { DEFAULT_SCATTER_SETTINGS } from "@/utils/defaultSettings";
import { ScatterChartSettings, ChartLayout } from "./ChartTypes";

export function createScatterChartSettings(
  field: string,
  layout: ChartLayout
): ScatterChartSettings {
  return {
    ...DEFAULT_SCATTER_SETTINGS,
    id: crypto.randomUUID(),
    title: `Scatter Plot - ${field} vs __ID`,
    field,
    xField: "__ID",
    yField: field,
    layout,
  };
}
