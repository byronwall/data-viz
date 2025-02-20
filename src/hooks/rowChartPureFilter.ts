import { datum, Filter, FilterRange, FilterValues } from "@/types/ChartTypes";

export function rowChartPureFilter(filters: datum[], value: datum) {
  if (!filters || filters.length === 0 || filters.includes(value)) {
    return true;
  }

  return false;
}

export function isFilterValues(filter: Filter): filter is FilterValues {
  return !(filter === null) && typeof filter === "object" && "values" in filter;
}

export function isFilterRange(filter: Filter): filter is FilterRange {
  return (
    !(filter === null) &&
    typeof filter === "object" &&
    "min" in filter &&
    "max" in filter
  );
}
