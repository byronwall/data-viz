import { DEFAULT_SUMMARY_SETTINGS } from "@/utils/defaultSettings";
import { SummaryChartSettings, ChartLayout } from "./ChartTypes";

export function createSummaryChartSettings(
  layout: ChartLayout
): SummaryChartSettings {
  return {
    ...DEFAULT_SUMMARY_SETTINGS,
    id: crypto.randomUUID(),
    layout,
  };
}
