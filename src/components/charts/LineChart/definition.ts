import {
  type BaseChartSettings,
  type ChartDefinition,
  type ChartLayout,
} from "@/types/ChartTypes";
import { LineChart as LineChartIcon } from "lucide-react";
import { LineChart } from "./LineChart";
import { LineChartSettingsPanel } from "./LineChartSettingsPanel";

export interface SeriesSettings {
  showPoints: boolean;
  pointSize: number;
  pointOpacity: number;
  lineWidth: number;
  lineOpacity: number;
  lineColor?: string;
  lineStyle: "solid" | "dashed" | "dotted";
  useRightAxis: boolean;
}

export interface LineChartSettings extends BaseChartSettings {
  type: "line";

  // Data fields
  xField: string;
  seriesField: string[];

  // Series settings
  seriesSettings: Record<string, SeriesSettings>;

  // Global line styling
  styles: {
    curveType: "linear" | "monotoneX" | "step";
  };

  // Grid options
  showXGrid: boolean;
  showYGrid: boolean;

  // Legend options
  showLegend: boolean;
  legendPosition: "top" | "right" | "bottom" | "left";
}

export const DEFAULT_SERIES_SETTINGS: SeriesSettings = {
  showPoints: false,
  pointSize: 4,
  pointOpacity: 1,
  lineWidth: 2,
  lineOpacity: 0.8,
  lineStyle: "solid",
  useRightAxis: false,
};

export const lineChartDefinition: ChartDefinition<LineChartSettings> = {
  type: "line",
  name: "Line Chart",
  description: "Display data as connected points over time or sequence",
  icon: LineChartIcon,
  component: LineChart,
  settingsPanel: LineChartSettingsPanel,
  createDefaultSettings: (layout: ChartLayout): LineChartSettings => ({
    id: "",
    type: "line",
    title: "",
    field: "",
    layout,
    colorScaleId: undefined,
    colorField: undefined,
    facet: {
      enabled: false,
      type: "grid",
      rowVariable: "",
      columnVariable: "",
    },
    xAxis: {},
    yAxis: {},
    margin: {},
    filters: [],
    xAxisLabel: "",
    yAxisLabel: "",
    xGridLines: 5,
    yGridLines: 5,
    xField: "",
    seriesField: [],
    seriesSettings: {},
    styles: {
      curveType: "linear",
    },
    showXGrid: true,
    showYGrid: true,
    showLegend: true,
    legendPosition: "top",
  }),
  validateSettings: (settings: LineChartSettings): boolean => {
    return settings.xField !== "" && settings.seriesField.length > 0;
  },
  getFilterFunction: (settings: LineChartSettings) => {
    return (row: any) => {
      return (
        row[settings.xField] != null &&
        settings.seriesField.every((field) => row[field] != null)
      );
    };
  },
};
