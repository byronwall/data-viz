import { barChartPureFilter } from "@/hooks/barChartPureFilter";
import {
  BaseChartSettings,
  ChartDefinition,
  Filter,
  FilterRange,
  FilterValues,
} from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ChartBarBig } from "lucide-react";
import { BarChart } from "./BarChart";
import { BarChartSettingsPanel } from "./BarChartSettingsPanel";

export interface BarChartSettings extends BaseChartSettings {
  type: "bar";
  binCount?: number;

  forceString?: boolean;

  filterValues: FilterValues;
  filterRange: FilterRange;
}

export const barChartDefinition: ChartDefinition<BarChartSettings> = {
  type: "bar",
  name: "Bar Chart",
  description: "Display data as vertical bars",
  icon: ChartBarBig,

  component: BarChart,
  settingsPanel: BarChartSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    field: field ?? "",
    binCount: 10,
    type: "bar",
    title: "Bar Chart",
    layout,
    margin: {},
    filterValues: { values: [] },
    filterRange: null,
  }),

  validateSettings: (settings) => {
    return !!settings.field;
  },

  filterData: (data: any[], filters: Filter) => {
    if (!filters.values?.length && !filters.range) {
      return data;
    }

    return data.filter((d) => barChartPureFilter(filters, d));
  },

  createFilterFromSelection: (selection: any, settings: BarChartSettings) => {
    if (typeof selection === "string") {
      return { values: [selection] };
    }
    if (
      typeof selection === "object" &&
      "min" in selection &&
      "max" in selection
    ) {
      return { range: selection };
    }
    return {};
  },
};
