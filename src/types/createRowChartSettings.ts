import { DEFAULT_ROW_SETTINGS } from "@/utils/defaultSettings";
import { RowChartSettings, ChartLayout } from "./ChartTypes";

export function createRowChartSettings(
  field: string,
  layout: ChartLayout
): RowChartSettings {
  return {
    ...DEFAULT_ROW_SETTINGS,
    id: crypto.randomUUID(),
    field,
    layout,
    title: `Row Chart: ${field}`,
  };
}
