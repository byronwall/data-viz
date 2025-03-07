import {
  BaseChartSettings,
  ChartDefinition,
  Filter,
  FilterRange,
  ScatterFilter,
} from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ScatterChart } from "lucide-react";

import { ScatterPlotSettingsPanel } from "./ScatterPlotSettingsPanel";
import { ScatterPlot } from "./ScatterPlot";
import { scatterChartPureFilter } from "@/hooks/scatterChartPureFilter";

export interface ScatterPlotSettings extends BaseChartSettings {
  type: "scatter";
  xField: string;
  yField: string;
  sizeField?: string;
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
    xField: field ?? "",
    yField: "",
    xFilterRange: null,
    yFilterRange: null,
  }),

  validateSettings: (settings) => {
    return !!settings.xField && !!settings.yField;
  },

  filterData: (data: any[], filters: Filter) => {
    if (
      !filters ||
      !("xFilterRange" in filters) ||
      !("yFilterRange" in filters)
    ) {
      return data;
    }

    const { xFilterRange, yFilterRange } = filters as ScatterFilter;
    if (!xFilterRange || !yFilterRange) {
      return data;
    }

    return data.filter((d) =>
      scatterChartPureFilter(filters as ScatterFilter, d)
    );
  },

  createFilterFromSelection: (
    selection: any,
    settings: ScatterPlotSettings
  ) => {
    if (
      typeof selection === "object" &&
      "x" in selection &&
      "y" in selection &&
      selection.x &&
      selection.y
    ) {
      return {
        xFilterRange: selection.x,
        yFilterRange: selection.y,
      } as ScatterFilter;
    }
    return {};
  },
};
