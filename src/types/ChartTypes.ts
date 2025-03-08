import { IdType } from "@/providers/DataLayerProvider";
import { Filter } from "./FilterTypes";

import {
  BarChart,
  BarChartBig,
  ScatterChart,
  Table,
  Box,
  Info,
  LucideIcon,
} from "lucide-react";
import { ThreeDScatterSettings } from "@/components/charts/ThreeDScatter/types";
import { BarChartSettings } from "@/components/charts/BarChart/definition";

export const CHART_TYPES = [
  { value: "row", label: "Row Chart", icon: BarChartBig },
  { value: "bar", label: "Bar Chart", icon: BarChart },
  { value: "scatter", label: "Scatter Plot", icon: ScatterChart },
  { value: "pivot", label: "Pivot Table", icon: Table },
  { value: "3d-scatter", label: "3D Scatter", icon: Box },
  { value: "summary", label: "Summary", icon: Info },
  { value: "data-table", label: "Data Table", icon: Table },
] as const;

export type ChartType = (typeof CHART_TYPES)[number]["value"];

export interface ChartTypeOption {
  value: ChartType;
  label: string;
  icon: React.ElementType;
}

export interface ChartLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Base facet settings interface
export interface BaseFacetSettings {
  enabled: boolean;
  type: "grid" | "wrap";
}

// Grid facet settings
export interface GridFacetSettings extends BaseFacetSettings {
  type: "grid";
  rowVariable: string;
  columnVariable: string;
}

// Wrap facet settings
export interface WrapFacetSettings extends BaseFacetSettings {
  type: "wrap";
  rowVariable: string;
  columnCount: number;
}

// Discriminated union for facet settings
export type FacetSettings = GridFacetSettings | WrapFacetSettings;

export interface AxisSettings {
  title?: string;
  scaleType?: "linear" | "log" | "time" | "band";
  grid?: boolean;
  min?: number;
  max?: number;
}

export interface MarginSettings {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface BaseChartSettings {
  id: string;
  title: string;
  type: ChartType;
  field: string;
  layout: ChartLayout;
  colorScaleId: string | undefined;
  colorField: string | undefined;
  facet: FacetSettings;
  xAxis: AxisSettings;
  yAxis: AxisSettings;
  margin: MarginSettings;
  filters: Filter[];

  // Label settings
  xAxisLabel: string;
  yAxisLabel: string;
  xGridLines: number;
  yGridLines: number;
}

export interface RowChartSettings extends BaseChartSettings {
  type: "row";
  minRowHeight: number;
  maxRowHeight: number;
}

export interface ScatterChartSettings extends BaseChartSettings {
  type: "scatter";
  xField: string;
  yField: string;
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

export interface SummaryChartSettings extends BaseChartSettings {
  type: "summary";
  // Inherits all base settings
  // No additional settings needed as this is a simple display
}

export interface DataTableSettings extends BaseChartSettings {
  type: "data-table";
  columns: Array<{
    id: string;
    field: string;
    width?: number;
  }>;
  pageSize: number;
  currentPage: number;
  sortBy?: string;
  sortDirection: "asc" | "desc";
  globalSearch: string;
  tableHeight: number;
}

export type ChartSettings =
  | RowChartSettings
  | BarChartSettings
  | ScatterChartSettings
  | PivotTableSettings
  | ThreeDScatterSettings
  | SummaryChartSettings
  | DataTableSettings;

export interface ChartSettingsPanelProps<
  TSettings extends BaseChartSettings = BaseChartSettings,
> {
  settings: TSettings;
  onSettingsChange: (settings: TSettings) => void;
}

export interface BaseChartProps<
  TSettings extends BaseChartSettings = BaseChartSettings,
> {
  settings: TSettings;
  width: number;
  height: number;
  facetIds?: IdType[];
}

export type datum = string | number | boolean | undefined;
export interface ChartDefinition<
  TSettings extends BaseChartSettings = BaseChartSettings,
> {
  // Metadata
  type: ChartType;
  name: string;
  description: string;
  icon: LucideIcon;

  // Component References
  component: React.ComponentType<BaseChartProps<TSettings>>;
  settingsPanel: React.ComponentType<ChartSettingsPanelProps<TSettings>>;

  // Settings Management
  createDefaultSettings: (layout: ChartLayout, field?: string) => TSettings;
  validateSettings: (settings: TSettings) => boolean;

  getFilterFunction: (
    settings: TSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => (d: IdType) => boolean;
}
