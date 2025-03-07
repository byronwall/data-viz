import { BaseChartSettings, ChartDefinition, Filter } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Table } from "lucide-react";

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
  rowFilterValues?: Record<string, Array<string | number>>;
  columnFilterValues?: Record<string, Array<string | number>>;
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
  }),

  validateSettings: (settings) => {
    return (
      settings.rowFields.length > 0 ||
      settings.columnFields.length > 0 ||
      settings.valueFields.length > 0
    );
  },

  filterData: (data: any[], filters: Filter) => {
    if (!filters || !("rowFilterValues" in filters)) {
      return data;
    }

    const { rowFilterValues, columnFilterValues } = filters as {
      rowFilterValues?: Record<string, Array<string | number>>;
      columnFilterValues?: Record<string, Array<string | number>>;
    };

    return data.filter((row) => {
      // Apply row filters
      if (rowFilterValues) {
        for (const [field, values] of Object.entries(rowFilterValues)) {
          if (!values.includes(row[field])) {
            return false;
          }
        }
      }

      // Apply column filters
      if (columnFilterValues) {
        for (const [field, values] of Object.entries(columnFilterValues)) {
          if (!values.includes(row[field])) {
            return false;
          }
        }
      }

      return true;
    });
  },

  createFilterFromSelection: (selection: any, settings: PivotTableSettings) => {
    if (
      typeof selection === "object" &&
      ("rowFilters" in selection || "columnFilters" in selection)
    ) {
      return {
        rowFilterValues: selection.rowFilters,
        columnFilterValues: selection.columnFilters,
      };
    }
    return {};
  },
};
