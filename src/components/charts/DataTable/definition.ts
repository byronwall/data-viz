import { BaseChartSettings, ChartDefinition, Filter } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Table } from "lucide-react";

import { DataTable } from "./DataTable";
import { DataTableSettingsPanel } from "./DataTableSettingsPanel";

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

  filterData: (data: any[], filters: Filter) => {
    if (!filters || !("filters" in filters)) {
      return data;
    }

    const { filters: columnFilters, globalSearch } = filters as {
      filters: Record<
        string,
        {
          value: string;
          operator: "contains" | "equals" | "startsWith" | "endsWith";
        }
      >;
      globalSearch?: string;
    };

    return data.filter((row) => {
      // Apply global search
      if (globalSearch) {
        const searchStr = globalSearch.toLowerCase();
        const matchesGlobal = Object.values(row).some(
          (value) => value && value.toString().toLowerCase().includes(searchStr)
        );
        if (!matchesGlobal) {
          return false;
        }
      }

      // Apply column filters
      for (const [field, filter] of Object.entries(columnFilters)) {
        const value = row[field];
        if (!value) {
          return false;
        }

        const strValue = value.toString().toLowerCase();
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case "contains":
            if (!strValue.includes(filterValue)) {
              return false;
            }
            break;
          case "equals":
            if (strValue !== filterValue) {
              return false;
            }
            break;
          case "startsWith":
            if (!strValue.startsWith(filterValue)) {
              return false;
            }
            break;
          case "endsWith":
            if (!strValue.endsWith(filterValue)) {
              return false;
            }
            break;
        }
      }

      return true;
    });
  },

  createFilterFromSelection: (selection: any, settings: DataTableSettings) => {
    if (
      typeof selection === "object" &&
      ("filters" in selection || "globalSearch" in selection)
    ) {
      return {
        filters: selection.filters || {},
        globalSearch: selection.globalSearch || "",
      };
    }
    return {};
  },
};
