import { IdType } from "@/providers/DataLayerProvider";
import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ChartBarBig } from "lucide-react";
import { BarChart } from "./BarChart";
import { BarChartSettingsPanel } from "./BarChartSettingsPanel";
import { getRangeFilterForField } from "@/hooks/getAxisFilter";
import { applyFilter } from "@/hooks/applyFilter";
import { Filter, ValueFilter } from "@/types/FilterTypes";

export interface BarChartSettings extends BaseChartSettings {
  type: "bar";
  binCount?: number;
  forceString?: boolean;
  filters: Filter[];
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
    filters: [],
  }),

  validateSettings: (settings) => {
    return !!settings.field;
  },

  getFilterFunction: (
    settings: BarChartSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    const dataHash = fieldGetter(settings.field);

    const valueFilter = settings.filters.find(
      (f): f is ValueFilter => f.type === "value" && f.field === settings.field
    );

    const rangeFilter = getRangeFilterForField(
      settings.filters,
      settings.field
    );

    return (d: IdType) => {
      const value = dataHash[d];

      if (valueFilter) {
        if (!applyFilter(value, valueFilter)) {
          return false;
        }
      }

      if (rangeFilter) {
        if (!applyFilter(value, rangeFilter)) {
          return false;
        }
      }

      return true;
    };
  },
};
