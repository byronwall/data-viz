import { RowChartSettings } from "./ChartTypes";

export function createRowChartSettings(): RowChartSettings {
  return {
    id: "row-chart",
    title: "Row Chart",
    field: "value",
    layout: {
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    },
    minRowHeight: 10,
    maxRowHeight: 100,
    rowFilters: {
      values: [],
    },
    type: "row",
  };
}
