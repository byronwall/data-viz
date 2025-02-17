import { ChartSettings } from "@/types/ChartTypes";
import crossfilter from "crossfilter2";

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

  constructor(private data: T[], idFunction: (item: T) => IdField) {
    console.log("[CrossfilterWrapper] Initializing with data:", {
      dataLength: data.length,
      sampleData: data.slice(0, 2),
    });
    this.ref = crossfilter(data);
    this.idFunction = idFunction;
    console.log("[CrossfilterWrapper] Initialization complete");
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

    const func = getFilterFunction<T>(chart);
    console.log(
      "[CrossfilterWrapper] Applying filter function for chart type:",
      chart.type
    );
    dimension.filterFunction(func);

    const allItems = dimension.groupAll();
    console.log("[CrossfilterWrapper] Created groupAll");

    for (const item of allItems) {
      filteredIds.add(item.key);
    }
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
}

function getFilterFunction<T>(chart: ChartSettings): (d: T) => boolean {
  console.log(
    "[CrossfilterWrapper] Creating filter function for chart type:",
    chart.type
  );

  switch (chart.type) {
    case "row":
      return (d: T) => {
        console.log("[CrossfilterWrapper] Row filter applied to data:", d);
        return true;
      };
    case "bar":
      return (d: T) => {
        console.log("[CrossfilterWrapper] Bar filter applied to data:", d);
        return true;
      };
    case "scatter":
      return (d: T) => {
        console.log("[CrossfilterWrapper] Scatter filter applied to data:", d);
        return true;
      };
  }
}
