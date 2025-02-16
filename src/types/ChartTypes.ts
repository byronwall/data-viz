export type BaseChartSettings = {
  id: string;
  title: string;
  field: string;
};

export type RowChartSettings = BaseChartSettings & {
  type: "row";
  sortBy?: "count" | "label";
};

export type BarChartSettings = BaseChartSettings & {
  type: "bar";
  binCount?: number;
};

export type ScatterPlotSettings = BaseChartSettings & {
  type: "scatter";
  xField: string;
  yField: string;
};

export type ChartSettings =
  | RowChartSettings
  | BarChartSettings
  | ScatterPlotSettings;
