import { Filter, datum } from "@/types/ChartTypes";
import { isFilterValues, isFilterRange } from "./rowChartPureFilter";

export function barChartPureFilter(filters: Filter, value: datum) {
  if (!filters) {
    return true;
  }

  if (isFilterValues(filters)) {
    return filters.values.includes(value);
  }

  if (isFilterRange(filters)) {
    if (value === undefined) {
      return false;
    }

    if (filters.min === undefined) {
      if (filters.max === undefined) {
        return true;
      }

      return value <= filters.max;
    }

    if (filters.max === undefined) {
      return value >= filters.min;
    }

    return value >= filters.min && value <= filters.max;
  }

  return false;
}
