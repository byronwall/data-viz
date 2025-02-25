import { RowChartSettings, ChartLayout } from "./ChartTypes";

export function createRowChartSettings(
  field: string,
  layout: ChartLayout
): RowChartSettings {
  return {
    id: crypto.randomUUID(),
    type: "row",
    title: `Row Chart - ${field}`,
    field,
    layout,
    colorScaleId: undefined,
    minRowHeight: 10,
    maxRowHeight: 100,
    filterValues: { values: [] },
  };
}
