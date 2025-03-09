import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { ValueFilter } from "@/types/FilterTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Table } from "lucide-react";

import { applyFilter } from "@/hooks/applyFilter";
import { IdType } from "@/providers/DataLayerProvider";
import { PivotTable } from "./PivotTable";
import { PivotTableSettingsPanel } from "./PivotTableSettingsPanel";

export interface PivotTableSettings extends BaseChartSettings {
  type: "pivot";
  rowFields: string[];
  columnFields: string[];
  valueFields: Array<{
    field: string;
    aggregation:
      | "sum"
      | "count"
      | "avg"
      | "min"
      | "max"
      | "median"
      | "mode"
      | "stddev"
      | "variance"
      | "countUnique"
      | "singleValue";
    formula?: string;
    label?: string;
  }>;
  showTotals: {
    row: boolean;
    column: boolean;
    grand: boolean;
  };
  dateBinning?: {
    field: string;
    type: "day" | "month" | "year";
  };
}

export const pivotTableDefinition: ChartDefinition<PivotTableSettings> = {
  type: "pivot",
  name: "Pivot Table",
  description: "Interactive pivot table for data analysis",
  icon: Table,

  component: PivotTable,
  settingsPanel: PivotTableSettingsPanel,

  createDefaultSettings: (layout) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "pivot",
    title: "Pivot Table",
    layout,
    margin: {},
    rowFields: [],
    columnFields: [],
    valueFields: [{ field: "", aggregation: "count" }],
    showTotals: {
      row: true,
      column: true,
      grand: true,
    },
    filters: [],
  }),

  validateSettings: (settings) => {
    return (
      settings.rowFields.length > 0 ||
      settings.columnFields.length > 0 ||
      settings.valueFields.length > 0
    );
  },

  getFilterFunction: (
    settings: PivotTableSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    // Get all value filters for row and column fields
    const rowFilters = settings.filters.filter(
      (f): f is ValueFilter =>
        f.type === "value" && settings.rowFields.includes(f.field)
    );
    const columnFilters = settings.filters.filter(
      (f): f is ValueFilter =>
        f.type === "value" && settings.columnFields.includes(f.field)
    );

    const noMatchingFilters =
      rowFilters.length === 0 && columnFilters.length === 0;

    return (d: IdType) => {
      if (noMatchingFilters) {
        return true;
      }

      // Check if the data point matches all active row filters
      const matchesRowFilters = rowFilters.every((filter) => {
        const dataHash = fieldGetter(filter.field);
        return applyFilter(dataHash[d], filter);
      });

      // Check if the data point matches all active column filters
      const matchesColumnFilters = columnFilters.every((filter) => {
        const dataHash = fieldGetter(filter.field);
        return applyFilter(dataHash[d], filter);
      });

      return matchesRowFilters && matchesColumnFilters;
    };
  },
};
