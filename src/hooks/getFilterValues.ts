import { ChartSettings } from "@/types/ChartTypes";

export function getFilterObj(chart: ChartSettings) {
  switch (chart.type) {
    case "row":
      return chart.filterValues;

    case "bar":
      return chart.filterValues ?? chart.filterRange;

    case "scatter":
      return {
        xFilterRange: chart.xFilterRange,
        yFilterRange: chart.yFilterRange,
      };
  }
}

export function getEmptyFilterObj(chart: ChartSettings) {
  switch (chart.type) {
    case "row":
      return { filterValues: { values: [] } };

    case "bar":
      return { filterValues: null, filterRange: null };

    case "scatter":
      return { xFilterRange: null, yFilterRange: null };
  }
}
