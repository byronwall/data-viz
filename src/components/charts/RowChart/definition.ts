import { BarChart } from "lucide-react";

import { RowChart } from "@/components/charts/RowChart/RowChart";
import {
  ChartDefinition,
  ChartLayout,
  Filter,
  RowChartSettings,
  datum,
  FilterValues,
} from "@/types/ChartTypes";
import { DEFAULT_ROW_SETTINGS } from "@/utils/defaultSettings";
import { RowChartSettingsPanel } from "./RowChartSettingsPanel";
import { IdType } from "@/providers/DataLayerProvider";
import { rowChartPureFilter } from "@/hooks/rowChartPureFilter";

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
  getFilterFunction: (
    settings: RowChartSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    const dataHash = fieldGetter(settings.field);
    const filters = settings.filterValues?.values;

    return (d: IdType) => rowChartPureFilter(filters, dataHash[d]);
  },
};
