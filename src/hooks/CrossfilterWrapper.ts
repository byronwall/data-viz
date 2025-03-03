import { ChartSettings, datum, PivotTableSettings } from "@/types/ChartTypes";
import crossfilter from "crossfilter2";
import isEqual from "react-fast-compare";
import { rowChartPureFilter } from "./rowChartPureFilter";
import { getFilterObj } from "./getFilterValues";
import { barChartPureFilter } from "./barChartPureFilter";
import { scatterChartPureFilter } from "./scatterChartPureFilter";
import { IdType } from "@/providers/DataLayerProvider";

interface FilterConfig {
  field: string;
  values: Set<string | number>;
}

type ChartDimension<TData, TId extends IdType> = {
  dimension: crossfilter.Dimension<TData, TId>;
  chart: ChartSettings;
};

export class CrossfilterWrapper<T> {
  ref: crossfilter.Crossfilter<T>;
  charts: Map<string, ChartDimension<T, IdType>> = new Map();
  idFunction: (item: T) => IdType;

  // assume this gets set after creation
  fieldGetter: (name: string) => Record<IdType, datum> = () => ({});

  constructor(data: T[], idFunction: (item: T) => IdType) {
    this.ref = crossfilter(data);
    this.idFunction = idFunction;
  }

  setFieldGetter(fieldGetter: (name: string) => Record<IdType, datum>) {
    this.fieldGetter = fieldGetter;
  }

  updateChart(chart: ChartSettings) {
    // check if the filters have changed
    const oldChart = this.charts.get(chart.id);

    if (!oldChart) {
      return;
    }

    const oldFilterValues = getFilterObj(oldChart.chart);
    const newFilterValues = getFilterObj(chart);

    if (!isEqual(oldFilterValues, newFilterValues)) {
      this.updateChartFilters(chart);
    }

    // need to update internal defs so diff works again
    this.charts.set(chart.id, {
      ...oldChart,
      chart,
    });
  }

  updateChartFilters(chart: ChartSettings) {
    // get the filters from the chart
    const filterFunc = this.getFilterFunction(chart);

    const foundChart = this.charts.get(chart.id);

    // apply the filters to the dimension
    const dimension = foundChart?.dimension;
    if (!dimension) {
      console.error("updateChartFilters: dimension not found", {
        chart,
        charts: this.charts,
      });
      return;
    }

    dimension.filterFunction(filterFunc);

    // this gives an object with key + value
    // the value will be 1 if the item should be rendered
    // will still need to check the value = 1 items in the actual chart with the filter func again
    // ideally wire up the hook to the raw crossfilter obj so charts can get IDs to render per dim
  }

  addChart(chart: ChartSettings) {
    // need to create a dimension for the chart
    const dimension = this.ref.dimension(this.idFunction);

    const chartDimension: ChartDimension<T, IdType> = {
      dimension,
      chart,
    };

    this.charts.set(chart.id, chartDimension);

    this.updateChartFilters(chart);
  }

  removeChart(chart: ChartSettings) {
    const savedChart = this.charts.get(chart.id);
    if (!savedChart) {
      throw new Error(`Chart ${chart.id} not found`);
    }

    savedChart.dimension.filterAll();
    savedChart.dimension.dispose();
    this.charts.delete(chart.id);
  }

  removeAllCharts() {
    // Clear and dispose all dimensions
    for (const chart of this.charts.values()) {
      chart.dimension.filterAll();
      chart.dimension.dispose();
    }
    // Clear the charts map
    this.charts.clear();
  }

  getFilterFunction(chart: ChartSettings): (d: IdType) => boolean {
    switch (chart.type) {
      case "row": {
        const dataHash = this.fieldGetter(chart.field);
        const filters = chart.filterValues?.values;

        return (d: IdType) => rowChartPureFilter(filters, dataHash[d]);
      }
      case "bar": {
        const dataHash = this.fieldGetter(chart.field);
        const filters = getFilterObj(chart);

        return (d: IdType) => barChartPureFilter(filters, dataHash[d]);
      }
      case "scatter": {
        const xDataHash = this.fieldGetter(chart.xField);
        const yDataHash = this.fieldGetter(chart.yField);

        return (d: IdType) =>
          scatterChartPureFilter(
            chart.xFilterRange,
            chart.yFilterRange,
            xDataHash[d],
            yDataHash[d]
          );
      }
      case "pivot": {
        // BEWARE: VERY UNLIKELY this is correct
        const pivotSettings = chart as PivotTableSettings;

        // Check if any row or column filters are active
        const rowFilters: FilterConfig[] = pivotSettings.rowFields.map(
          (field: string) => ({
            field,
            values: new Set(pivotSettings.rowFilterValues?.[field] || []),
          })
        );

        const columnFilters: FilterConfig[] = pivotSettings.columnFields.map(
          (field: string) => ({
            field,
            values: new Set(pivotSettings.columnFilterValues?.[field] || []),
          })
        );

        const noMatchingFilters =
          rowFilters.every((f: FilterConfig) => f.values.size === 0) &&
          columnFilters.every((f: FilterConfig) => f.values.size === 0);

        const rowGetter = rowFilters.map((f: FilterConfig) => {
          return this.fieldGetter(f.field);
        });

        const columnGetter = columnFilters.map((f: FilterConfig) => {
          return this.fieldGetter(f.field);
        });

        return (d: IdType) => {
          if (noMatchingFilters) {
            return true;
          }
          // Check if the data point matches any active row filters
          const matchesRowFilters = rowFilters.every(
            (filter: FilterConfig, index: number) => {
              if (filter.values.size === 0) {
                return true;
              }
              const value = rowGetter[index][d];
              return filter.values.has(value as string | number);
            }
          );

          // Check if the data point matches any active column filters
          const matchesColumnFilters = columnFilters.every(
            (filter: FilterConfig, index: number) => {
              if (filter.values.size === 0) {
                return true;
              }
              const value = columnGetter[index][d];
              return filter.values.has(value as string | number);
            }
          );

          return matchesRowFilters && matchesColumnFilters;
        };
      }
    }
  }

  getAllData() {
    // obj with key as id and value as datum

    // id -> count
    const data: LiveItemMap = {};

    const commonNonce = new Date().getTime();

    for (const chart of this.charts.values()) {
      data[chart.chart.id] = {
        items: chart.dimension.group<IdType, number>().all(),
        nonce: commonNonce,
      };
    }

    return data;
  }
}

export type LiveItem = {
  items: readonly crossfilter.Grouping<IdType, number>[];
  nonce: number;
};

export type LiveItemMap = Record<string, LiveItem>;
