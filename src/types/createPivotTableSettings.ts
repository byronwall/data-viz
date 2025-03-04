import { DEFAULT_PIVOT_SETTINGS } from "@/utils/defaultSettings";
import { PivotTableSettings } from "./ChartTypes";
import { ChartLayout } from "./ChartTypes";

export function createPivotTableSettings(
  field: string,
  layout: ChartLayout
): PivotTableSettings {
  return {
    ...DEFAULT_PIVOT_SETTINGS,
    id: crypto.randomUUID(),
    title: "Pivot Table",
    field,
    layout,
    rowFields: [field],
    columnFields: [],
    valueFields: [
      {
        field,
        aggregation: "count",
      },
    ],
  };
}
