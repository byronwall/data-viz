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
