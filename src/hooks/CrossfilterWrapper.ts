import { ChartSettings, datum } from "@/types/ChartTypes";
import crossfilter from "crossfilter2";
import isEqual from "react-fast-compare";
import { rowChartPureFilter } from "./rowChartPureFilter";
import { getFilterObj } from "./getFilterValues";
import { barChartPureFilter } from "./barChartPureFilter";

type IdField = number | string;

type ChartDimension<TData, TId extends IdField> = {
  dimension: crossfilter.Dimension<TData, TId>;
  chart: ChartSettings;
};

export class CrossfilterWrapper<T> {
  ref: crossfilter.Crossfilter<T>;
  charts: Map<string, ChartDimension<T, IdField>> = new Map();
  idFunction: (item: T) => IdField;
  dataHash: Record<string, T> = {};

  constructor(data: T[], idFunction: (item: T) => IdField) {
    this.ref = crossfilter(data);
    this.idFunction = idFunction;
    this.dataHash = data.reduce((acc, item) => {
      acc[idFunction(item)] = item;
      return acc;
    }, {} as Record<string, T>);
  }

  updateCharts(updatedCharts: ChartSettings[]) {
    // do some work to diff before and after - determine which charts added, removed or filters that change
    // need a dim for each chart.

    // remove charts that are no longer in the list
    for (const chart of this.charts.values()) {
      if (!updatedCharts.some((c) => c.id === chart.chart.id)) {
        this.removeChart(chart.chart);
      }
    }

    // add charts that are new
    for (const chart of updatedCharts) {
      if (!this.charts.has(chart.id)) {
        this.addChart(chart);
      }
    }

    // update charts that are in both lists
    for (const chart of this.charts.values()) {
      // find corresponding chart in updatedCharts via ID
      // pass the new defs in to update the old
      const newChart = updatedCharts.find((c) => c.id === chart.chart.id);

      const isDiff = !isEqual(chart.chart, newChart);

      if (isDiff && newChart) {
        this.updateChart(newChart);
      }
    }
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
    const filterFunc = this.getFilterFunction<T>(chart);

    console.log("updateChartFilters", {
      chart,
      charts: this.charts,
    });

    const foundChart = this.charts.get(chart.id);

    console.log("foundChart", foundChart);

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

    const chartDimension: ChartDimension<T, IdField> = {
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

  getFilterFunction(chart: ChartSettings): (d: IdField) => boolean {
    switch (chart.type) {
      case "row":
        return (d: IdField) => {
          // check if value is in the filters
          const filters = chart.filterValues?.values;

          const dataum = this.dataHash[d];

          const value = dataum[chart.field as keyof T] as datum;

          return rowChartPureFilter(filters, value);
        };
      case "bar":
        return (d: IdField) => {
          const filters = getFilterObj(chart);

          const dataum = this.dataHash[d];

          const value = dataum[chart.field as keyof T] as datum;

          return barChartPureFilter(filters, value);
        };
      case "scatter":
        return (d: IdField) => {
          return true;
        };
    }
  }

  getAllData() {
    // obj with key as id and value as datum

    // id -> count
    const data: LiveItemMap = {};

    const commonNonce = new Date().getTime();

    for (const chart of this.charts.values()) {
      data[chart.chart.id] = {
        items: chart.dimension.group<IdField, number>().all(),
        nonce: commonNonce,
      };
    }

    return data;
  }
}

export type LiveItem = {
  items: readonly crossfilter.Grouping<IdField, number>[];
  nonce: number;
};

export type LiveItemMap = Record<string, LiveItem>;
