import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Table } from "lucide-react";

import { DataTable } from "./DataTable";
import { DataTableSettingsPanel } from "./DataTableSettingsPanel";
import { IdType } from "@/providers/DataLayerProvider";
import { Filter, TextFilter } from "@/types/FilterTypes";
import { applyFilter } from "@/hooks/useFilters";

export interface DataTableSettings extends BaseChartSettings {
  type: "data-table";
  columns: Array<{
    id: string;
    field: string;
    width?: number;
  }>;
  pageSize: number;
  currentPage: number;
  sortBy?: string;
  sortDirection: "asc" | "desc";
  filters: Filter[];
  globalSearch: string;
  tableHeight: number;
}

export const dataTableDefinition: ChartDefinition<DataTableSettings> = {
  type: "data-table",
  name: "Data Table",
  description: "Interactive data table with sorting and filtering",
  icon: Table,

  component: DataTable,
  settingsPanel: DataTableSettingsPanel,

  createDefaultSettings: (layout) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "data-table",
    title: "Data Table",
    layout,
    margin: {},
    columns: [],
    pageSize: 25,
    currentPage: 1,
    sortDirection: "asc",
    filters: [],
    globalSearch: "",
    tableHeight: 400,
  }),

  validateSettings: (settings) => {
    return settings.columns.length > 0;
  },

  getFilterFunction: (
    settings: DataTableSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    // If no filters are active, return true
    if (settings.filters.length === 0) {
      return (d: IdType) => true;
    }

    // Create filter functions for each active filter
    const filterFunctions = settings.filters.map((filter) => {
      const column = settings.columns.find((col) => col.field === filter.field);
      if (!column) {
        return () => true;
      }

      const dataHash = fieldGetter(column.field);

      return (d: IdType) => {
        const value = dataHash[d];
        if (value === undefined) {
          return false;
        }

        if (applyFilter(value, filter)) {
          return true;
        }

        return false;
      };
    });

    // Combine all filter functions with AND logic
    return (d: IdType) => filterFunctions.every((fn) => fn(d));
  },
};
