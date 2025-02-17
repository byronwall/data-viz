export const CHART_TYPES = [
  { value: "row", label: "Row Chart" },
  { value: "bar", label: "Bar Chart" },
  { value: "scatter", label: "Scatter Plot" },
] as const;

export type ChartType = (typeof CHART_TYPES)[number]["value"];

export interface ChartLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
}

export interface BaseChartSettings {
  id: string;
  title: string;
  field: string;
  layout: ChartLayout;
}

export interface RowChartSettings extends BaseChartSettings {
  type: "row";
  sortBy?: "count" | "label";
}

export interface BarChartSettings extends BaseChartSettings {
  type: "bar";
  binCount?: number;
}

export interface ScatterPlotSettings extends BaseChartSettings {
  type: "scatter";
  xField: string;
  yField: string;
}

export type ChartSettings =
  | RowChartSettings
  | BarChartSettings
  | ScatterPlotSettings;
