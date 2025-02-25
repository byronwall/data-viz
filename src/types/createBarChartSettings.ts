import { BarChartSettings, ChartLayout } from "./ChartTypes";

export function createBarChartSettings(
  field: string,
  layout: ChartLayout
): BarChartSettings {
  return {
    id: crypto.randomUUID(),
    type: "bar",
    title: `Bar Chart - ${field}`,
    field,
    layout,
    colorScaleId: undefined,
    filterValues: { values: [] },
    filterRange: null,
  };
}
