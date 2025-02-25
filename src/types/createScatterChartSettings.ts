import { ScatterChartSettings, ChartLayout } from "./ChartTypes";

export function createScatterChartSettings(
  field: string,
  layout: ChartLayout
): ScatterChartSettings {
  return {
    id: crypto.randomUUID(),
    type: "scatter",
    title: `Scatter Plot - ${field} vs __ID`,
    field,
    xField: "__ID",
    yField: field,
    layout,
    colorScaleId: undefined,
    xFilterRange: null,
    yFilterRange: null,
  };
}
