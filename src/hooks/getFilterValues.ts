import { ChartSettings, Filter } from "@/types/ChartTypes";

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

export function isEmptyFilter(filter: Filter): boolean {
  if (!filter) {
    return true;
  }

  if ("values" in filter) {
    return filter.values.length === 0;
  }

  if ("min" in filter) {
    return filter.min === null && filter.max === null;
  }

  if ("x" in filter) {
    return isEmptyFilter(filter.x) && isEmptyFilter(filter.y);
  }

  return false;
}
