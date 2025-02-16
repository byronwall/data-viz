export type BaseChartSettings = {
  id: string;
  title: string;
  field: string;
};

export type RowChartSettings = BaseChartSettings & {
  type: "row";
  sortBy?: "count" | "label";
};

export interface BarChartSettings extends BaseChartSettings {
  type: "bar";
  binCount?: number; // Optional number of bins for numeric data
}

export type ScatterPlotSettings = BaseChartSettings & {
  type: "scatter";
  xField: string;
  yField: string;
};

export type ChartSettings =
  | RowChartSettings
  | BarChartSettings
  | ScatterPlotSettings;
