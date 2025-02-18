import { ChartSettings } from "@/types/ChartTypes";
import crossfilter from "crossfilter2";
import isEqual from "react-fast-compare";
import { rowChartPureFilter } from "./rowChartPureFilter";

type IdField = number | string;

type ChartDimension<TData, TId extends IdField> = {
  dimension: crossfilter.Dimension<TData, TId>;
  chart: ChartSettings;
  filteredIds: Set<TId>;
};

export class CrossfilterWrapper<T> {
  ref: crossfilter.Crossfilter<T>;
  charts: Map<string, ChartDimension<T, IdField>> = new Map();
  idFunction: (item: T) => IdField;
  dataHash: Record<string, T> = {};

  constructor(private data: T[], idFunction: (item: T) => IdField) {
    console.log("[CrossfilterWrapper] Initializing with data:", {
      dataLength: data.length,
      sampleData: data.slice(0, 2),
    });
    this.ref = crossfilter(data);
    this.idFunction = idFunction;
    this.dataHash = data.reduce((acc, item) => {
      acc[idFunction(item)] = item;
      return acc;
    }, {} as Record<string, T>);
    console.log("[CrossfilterWrapper] Initialization complete");
  }

  updateCharts(updatedCharts: ChartSettings[]) {
    console.log("[CrossfilterWrapper] Updating charts:", {
      chartsLength: updatedCharts.length,
    });

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
    console.log("[CrossfilterWrapper] Updating chart:", {
      chartId: chart.id,
      chartType: chart.type,
      settings: chart,
    });

    // check if the filters have changed
    const oldChart = this.charts.get(chart.id);
    console.log("[CrossfilterWrapper] Old chart:", oldChart);
    if (oldChart) {
      console.log("[CrossfilterWrapper] Check filters:", {
        oldFilters: oldChart.chart.rowFilters,
        newFilters: chart.rowFilters,
      });
      // TODO: do a proper diff
      if (oldChart.rowFilters !== chart.rowFilters) {
        console.log("[CrossfilterWrapper] Filters changed:", {
          oldFilters: oldChart.rowFilters,
          newFilters: chart.rowFilters,
        });
        this.updateChartFilters(chart);
      }
    }
  }

  updateChartFilters(chart: ChartSettings) {
    console.log("[CrossfilterWrapper] Updating chart filters:", {
      chartId: chart.id,
      chartType: chart.type,
      settings: chart,
    });

    // get the filters from the chart
    const filterFunc = this.getFilterFunction<T>(chart);

    // apply the filters to the dimension
    const dimension = this.charts.get(chart.id)?.dimension;
    if (!dimension) {
      console.error("[CrossfilterWrapper] Dimension not found:", chart.id);
      return;
    }

    console.log(
      "Data before filter is applied:",
      dimension
        .group()
        .all()
        .filter((c) => c.value > 0)
    );

    const newDim = dimension.filterFunction(filterFunc);

    this.charts.set(chart.id, {
      ...this.charts.get(chart.id)!,
      dimension: newDim,
    });

    console.log(
      "Data after filter is applied:",
      newDim
        .group()
        .all()
        .filter((c) => c.value > 0)
    );

    // this gives an object with key + value
    // the value will be 1 if the item should be rendered
    // will still need to check the value = 1 items in the actual chart with the filter func again
    // ideally wire up the hook to the raw crossfilter obj so charts can get IDs to render per dim
  }

  addChart(chart: ChartSettings) {
    console.log("[CrossfilterWrapper] Adding chart:", {
      chartId: chart.id,
      chartType: chart.type,
      settings: chart,
    });

    // need to create a dimension for the chart
    const dimension = this.ref.dimension(this.idFunction);
    console.log("[CrossfilterWrapper] Created dimension");

    const filteredIds = new Set<IdField>();

    const chartDimension: ChartDimension<T, IdField> = {
      dimension,
      chart,
      filteredIds: filteredIds,
    };

    this.updateChartFilters(chart);

    console.log("[CrossfilterWrapper] Collected filtered IDs:", {
      filteredCount: filteredIds.size,
      sampleIds: Array.from(filteredIds).slice(0, 3),
    });

    this.charts.set(chart.id, chartDimension);
    console.log(
      "[CrossfilterWrapper] Chart added successfully. Total charts:",
      this.charts.size
    );
  }

  removeChart(chart: ChartSettings) {
    console.log("[CrossfilterWrapper] Removing chart:", {
      chartId: chart.id,
      chartType: chart.type,
    });

    const savedChart = this.charts.get(chart.id);
    if (!savedChart) {
      console.error("[CrossfilterWrapper] Chart not found:", chart.id);
      throw new Error(`Chart ${chart.id} not found`);
    }

    savedChart.dimension.filterAll();
    this.charts.delete(chart.id);
    console.log(
      "[CrossfilterWrapper] Chart removed successfully. Remaining charts:",
      this.charts.size
    );
  }

  getFilterFunction(chart: ChartSettings): (d: IdField) => boolean {
    console.log(
      "[CrossfilterWrapper] Creating filter function for chart type:",
      chart.type
    );

    switch (chart.type) {
      case "row":
        return (d: IdField) => {
          // check if value is in the filters
          const filters = chart.rowFilters?.values;

          const dataum = this.dataHash[d];

          const value = dataum[chart.field];

          return rowChartPureFilter(filters, value);
        };
      case "bar":
        return (d: IdField) => {
          console.log("[CrossfilterWrapper] Bar filter applied to data:", d);
          return true;
        };
      case "scatter":
        return (d: IdField) => {
          console.log(
            "[CrossfilterWrapper] Scatter filter applied to data:",
            d
          );
          return true;
        };
    }
  }
}
