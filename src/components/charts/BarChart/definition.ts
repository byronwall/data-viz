import { barChartPureFilter } from "@/hooks/barChartPureFilter";
import {
  BaseChartSettings,
  ChartDefinition,
  Filter,
  FilterRange,
  FilterValues,
  datum,
} from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ChartBarBig } from "lucide-react";
import { BarChart } from "./BarChart";
import { BarChartSettingsPanel } from "./BarChartSettingsPanel";
import { getFilterObj } from "@/hooks/getFilterValues";
import { IdType } from "@/providers/DataLayerProvider";

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

  getFilterFunction: (
    settings: BarChartSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    const dataHash = fieldGetter(settings.field);
    const filters = getFilterObj(settings);

    return (d: IdType) => barChartPureFilter(filters, dataHash[d]);
  },
};
