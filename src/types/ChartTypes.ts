export const CHART_TYPES = [
  { value: "row", label: "Row Chart" },
  { value: "bar", label: "Bar Chart" },
  { value: "scatter", label: "Scatter Plot" },
  { value: "pivot", label: "Pivot Table" },
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
  colorScaleId?: string;
  colorField?: string;
}

export interface RowChartSettings extends BaseChartSettings {
  type: "row";
  sortBy?: "count" | "label";
  minRowHeight: number; // Minimum height of each row in pixels
  maxRowHeight: number; // Maximum height of each row in pixels

  filterValues: FilterValues;
}

export interface BarChartSettings extends BaseChartSettings {
  type: "bar";
  binCount?: number;

  forceString?: boolean;

  filterValues: FilterValues;
  filterRange: FilterRange;
}

export interface ScatterChartSettings extends BaseChartSettings {
  type: "scatter";
  xField: string;
  yField: string;

  xFilterRange: FilterRange;
  yFilterRange: FilterRange;
}

export interface PivotTableSettings extends BaseChartSettings {
  type: "pivot";
  rowFields: string[];
  columnFields: string[];
  valueFields: Array<{
    field: string;
    aggregation:
      | "sum"
      | "count"
      | "avg"
      | "min"
      | "max"
      | "median"
      | "mode"
      | "stddev"
      | "variance"
      | "countUnique"
      | "singleValue";
    formula?: string;
    label?: string;
  }>;
  showTotals: {
    row: boolean;
    column: boolean;
    grand: boolean;
  };
  dateBinning?: {
    field: string;
    type: "day" | "month" | "year";
  };
  rowFilterValues?: Record<string, Array<string | number>>;
  columnFilterValues?: Record<string, Array<string | number>>;
}

export type ChartSettings =
  | RowChartSettings
  | BarChartSettings
  | ScatterChartSettings
  | PivotTableSettings;

export interface BaseChartProps {
  settings: ChartSettings;
  width: number;
  height: number;
}

export type datum = string | number | boolean | undefined;

export type FilterValues = {
  values: datum[];
};

export type FilterRange = {
  min: datum;
  max: datum;
} | null;

export type Filter2dRange = {
  x: FilterRange;
  y: FilterRange;
} | null;

export type ScatterFilter = {
  xFilterRange: FilterRange;
  yFilterRange: FilterRange;
};

export type Filter =
  | FilterValues
  | FilterRange
  | Filter2dRange
  | ScatterFilter
  | undefined;
