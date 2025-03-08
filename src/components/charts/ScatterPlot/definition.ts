import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ScatterChart } from "lucide-react";

import { ScatterPlotSettingsPanel } from "./ScatterPlotSettingsPanel";
import { ScatterPlot } from "./ScatterPlot";
import { IdType } from "@/providers/DataLayerProvider";
import { applyFilter, getAxisFilter } from "@/hooks/useFilters";
import { Filter } from "@/types/FilterTypes";

export interface ScatterPlotSettings extends BaseChartSettings {
  type: "scatter";
  xField: string;
  yField: string;
  filters: Filter[];
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
    filters: [],
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

    const xFilter = getAxisFilter(settings.filters, settings.xField);
    const yFilter = getAxisFilter(settings.filters, settings.yField);

    return (d: IdType) => {
      if (!xFilter && !yFilter) {
        return true;
      }

      const xValue = xDataHash[d];
      const yValue = yDataHash[d];

      // check both for exclusion -- if OK, then return true
      // we need both to be true to return true
      if (xFilter && !applyFilter(xValue, xFilter)) {
        return false;
      }

      if (yFilter && !applyFilter(yValue, yFilter)) {
        return false;
      }

      return true;
    };
  },
};
