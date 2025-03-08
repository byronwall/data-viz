import {
  BaseChartSettings,
  ChartDefinition,
  Filter,
  datum,
} from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Table } from "lucide-react";

import { PivotTable } from "./PivotTable";
import { PivotTableSettingsPanel } from "./PivotTableSettingsPanel";
import { IdType } from "@/providers/DataLayerProvider";

interface FilterConfig {
  field: string;
  values: Set<string | number>;
}

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

  getFilterFunction: (
    settings: PivotTableSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    // Check if any row or column filters are active
    const rowFilters: FilterConfig[] = settings.rowFields.map(
      (field: string) => ({
        field,
        values: new Set(settings.rowFilterValues?.[field] || []),
      })
    );

    const columnFilters: FilterConfig[] = settings.columnFields.map(
      (field: string) => ({
        field,
        values: new Set(settings.columnFilterValues?.[field] || []),
      })
    );

    const noMatchingFilters =
      rowFilters.every((f) => f.values.size === 0) &&
      columnFilters.every((f) => f.values.size === 0);

    const rowGetter = rowFilters.map((f) => {
      return fieldGetter(f.field);
    });

    const columnGetter = columnFilters.map((f) => {
      return fieldGetter(f.field);
    });

    return (d: IdType) => {
      if (noMatchingFilters) {
        return true;
      }
      // Check if the data point matches any active row filters
      const matchesRowFilters = rowFilters.every((filter, index) => {
        if (filter.values.size === 0) {
          return true;
        }
        const value = rowGetter[index][d];
        return filter.values.has(value as string | number);
      });

      // Check if the data point matches any active column filters
      const matchesColumnFilters = columnFilters.every((filter, index) => {
        if (filter.values.size === 0) {
          return true;
        }
        const value = columnGetter[index][d];
        return filter.values.has(value as string | number);
      });

      return matchesRowFilters && matchesColumnFilters;
    };
  },
};
