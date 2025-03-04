import { DEFAULT_BAR_SETTINGS } from "@/utils/defaultSettings";
import { BarChartSettings, ChartLayout } from "./ChartTypes";

export function createBarChartSettings(
  field: string,
  layout: ChartLayout
): BarChartSettings {
  return {
    ...DEFAULT_BAR_SETTINGS,
    id: crypto.randomUUID(),
    title: `Bar Chart - ${field}`,
    field,
    layout,
  };
}
