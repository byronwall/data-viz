import { DEFAULT_DATA_TABLE_SETTINGS } from "@/utils/defaultSettings";
import { DataTableSettings, ChartLayout } from "./ChartTypes";

export function createDataTableSettings(
  layout: ChartLayout
): DataTableSettings {
  return {
    ...DEFAULT_DATA_TABLE_SETTINGS,
    id: crypto.randomUUID(),
    title: "Data Table",
    layout,
  };
}
