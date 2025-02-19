import { datum } from "@/types/ChartTypes";

export function rowChartPureFilter(filters: datum[], value: datum) {
  if (!filters || filters.length === 0 || filters.includes(value)) {
    return true;
  }
  return false;
}
