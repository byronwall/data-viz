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
  FileText,
} from "lucide-react";
import { ThreeDScatterSettings } from "@/components/charts/ThreeDScatter/types";
import { BarChartSettings } from "@/components/charts/BarChart/definition";
import { PivotTableSettings } from "@/components/charts/PivotTable/definition";
import { ScatterPlotSettings } from "@/components/charts/ScatterPlot/definition";
import { DataTableSettings } from "@/components/charts/DataTable/definition";
import { SummaryTableSettings } from "@/components/charts/SummaryTable/definition";
import { MarkdownSettings } from "@/components/charts/Markdown/definition";

export const CHART_TYPES = [
  { value: "row", label: "Row Chart", icon: BarChartBig },
  { value: "bar", label: "Bar Chart", icon: BarChart },
  { value: "scatter", label: "Scatter Plot", icon: ScatterChart },
  { value: "pivot", label: "Pivot Table", icon: Table },
  { value: "3d-scatter", label: "3D Scatter", icon: Box },
  { value: "summary", label: "Summary", icon: Info },
  { value: "data-table", label: "Data Table", icon: Table },
  { value: "markdown", label: "Markdown", icon: FileText },
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

export type ChartSettings =
  | RowChartSettings
  | BarChartSettings
  | ScatterPlotSettings
  | PivotTableSettings
  | ThreeDScatterSettings
  | SummaryTableSettings
  | DataTableSettings
  | MarkdownSettings;

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
  settingsPanel: React.ComponentType<ChartSettingsPanelProps<TSettings>> | null;

  // Settings Management
  createDefaultSettings: (layout: ChartLayout, field?: string) => TSettings;
  validateSettings: (settings: TSettings) => boolean;

  getFilterFunction: (
    settings: TSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => (d: IdType) => boolean;
}
