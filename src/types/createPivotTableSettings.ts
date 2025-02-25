import { PivotTableSettings } from "./ChartTypes";
import { ChartLayout } from "./ChartTypes";

export function createPivotTableSettings(
  field: string,
  layout: ChartLayout
): PivotTableSettings {
  return {
    id: crypto.randomUUID(),
    type: "pivot",
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
    showTotals: {
      row: true,
      column: true,
      grand: true,
    },
  };
}
