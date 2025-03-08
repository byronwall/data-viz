import {
  BaseChartSettings,
  ChartDefinition,
  Filter,
  FilterRange,
  ScatterFilter,
  datum,
} from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ScatterChart } from "lucide-react";

import { ScatterPlotSettingsPanel } from "./ScatterPlotSettingsPanel";
import { ScatterPlot } from "./ScatterPlot";
import { scatterChartPureFilter } from "@/hooks/scatterChartPureFilter";
import { IdType } from "@/providers/DataLayerProvider";

export interface ScatterPlotSettings extends BaseChartSettings {
  type: "scatter";
  xField: string;
  yField: string;
  xFilterRange: FilterRange;
  yFilterRange: FilterRange;
}

export const scatterPlotDefinition: ChartDefinition<ScatterPlotSettings> = {
  type: "scatter",
  name: "Scatter Plot",
  description: "Display data as points in a 2D space",
  icon: ScatterChart,

  component: ScatterPlot,
  settingsPanel: ScatterPlotSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "scatter",
    title: "Scatter Plot",
    layout,
    margin: {},
    xField: "__ID",
    yField: field ?? "",
    xFilterRange: null,
    yFilterRange: null,
  }),

  validateSettings: (settings) => {
    return !!settings.xField && !!settings.yField;
  },
  getFilterFunction: (
    settings: ScatterPlotSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    const xDataHash = fieldGetter(settings.xField);
    const yDataHash = fieldGetter(settings.yField);

    return (d: IdType) =>
      scatterChartPureFilter(
        settings.xFilterRange,
        settings.yFilterRange,
        xDataHash[d],
        yDataHash[d]
      );
  },
};
