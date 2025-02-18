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
  minRowHeight: number; // Minimum height of each row in pixels
  maxRowHeight: number; // Maximum height of each row in pixels
  rowFilters: FilterValues;
}

export interface BarChartSettings extends BaseChartSettings {
  type: "bar";
  binCount?: number;
}

export interface ScatterChartSettings extends BaseChartSettings {
  type: "scatter";
  xField: string;
  yField: string;
}

export type ChartSettings =
  | RowChartSettings
  | BarChartSettings
  | ScatterChartSettings;

export interface BaseChartProps {
  settings: ChartSettings;
  width: number;
  height: number;
}

export type datum = string | number | boolean | undefined;

type FilterValues = {
  values: datum[];
};

type FilterRange = {
  min: datum;
  max: datum;
};

type Filter2dRange = {
  x: FilterRange;
  y: FilterRange;
};

export type Filter = FilterValues | FilterRange | Filter2dRange;
