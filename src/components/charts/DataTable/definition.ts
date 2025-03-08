import {
  BaseChartSettings,
  ChartDefinition,
  Filter,
  datum,
} from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Table } from "lucide-react";

import { DataTable } from "./DataTable";
import { DataTableSettingsPanel } from "./DataTableSettingsPanel";
import { IdType } from "@/providers/DataLayerProvider";

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
  filters: Record<
    string,
    {
      value: string;
      operator: "contains" | "equals" | "startsWith" | "endsWith";
    }
  >;
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
    filters: {},
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
    if (Object.keys(settings.filters).length === 0) {
      return (d: IdType) => true;
    }

    // Create filter functions for each active filter
    const filterFunctions = Object.entries(settings.filters).map(
      ([columnId, filter]) => {
        const column = settings.columns.find((col) => col.id === columnId);
        if (!column) {
          return () => true;
        }

        const dataHash = fieldGetter(column.field);

        return (d: IdType) => {
          const value = dataHash[d];
          if (value === undefined) {
            return false;
          }

          switch (filter.operator) {
            case "contains":
              return String(value)
                .toLowerCase()
                .includes(String(filter.value).toLowerCase());
            case "equals":
              return String(value) === String(filter.value);
            case "startsWith":
              return String(value)
                .toLowerCase()
                .startsWith(String(filter.value).toLowerCase());
            case "endsWith":
              return String(value)
                .toLowerCase()
                .endsWith(String(filter.value).toLowerCase());
            default:
              return true;
          }
        };
      }
    );

    // Combine all filter functions with AND logic
    return (d: IdType) => filterFunctions.every((fn) => fn(d));
  },
};
