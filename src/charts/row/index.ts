import { BarChart } from "lucide-react";

import {
  ChartDefinition,
  RowChartSettings,
  ChartLayout,
} from "@/types/ChartTypes";
import { Filter } from "@/types/ChartTypes";
import { RowChart } from "@/components/charts/RowChart";
import { RowChartSettingsPanel } from "./RowChartSettingsPanel";
import { DEFAULT_ROW_SETTINGS } from "@/utils/defaultSettings";

export const rowChartDefinition: ChartDefinition<RowChartSettings> = {
  type: "row",
  name: "Row Chart",
  description: "A horizontal bar chart showing values by category",
  icon: BarChart,

  component: RowChart,
  settingsPanel: RowChartSettingsPanel,

  createDefaultSettings: (layout: ChartLayout, field?: string) => ({
    ...DEFAULT_ROW_SETTINGS,
    id: crypto.randomUUID(),
    layout,
    field: field ?? "",
  }),

  validateSettings: (settings) => {
    return Boolean(settings.field);
  },

  filterData: (data: any[], filters: Filter) => {
    // TODO: implement filtering logic
    return data;
  },

  createFilterFromSelection: (
    selection: any,
    settings: RowChartSettings
  ): Filter => {
    // TODO: implement filter creation from selection
    return {
      type: "values",
      field: settings.field,
      values: [],
    };
  },
};
