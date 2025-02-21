import { Filter, datum } from "@/types/ChartTypes";
import { isFilterRange } from "./rowChartPureFilter";

export function scatterChartPureFilter(
  xFilter: Filter,
  yFilter: Filter,
  xValue: datum,
  yValue: datum
) {
  const xPasses = filterSingleValue(xFilter, xValue);
  const yPasses = filterSingleValue(yFilter, yValue);

  return xPasses && yPasses;
}

function filterSingleValue(filter: Filter, value: datum): boolean {
  if (!filter) {
    return true;
  }

  if (isFilterRange(filter)) {
    if (value === undefined) {
      return false;
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
      return false;
    }

    const min = filter.min !== undefined ? Number(filter.min) : undefined;
    const max = filter.max !== undefined ? Number(filter.max) : undefined;

    if (min === undefined) {
      if (max === undefined) {
        return true;
      }

      return numValue <= max;
    }

    if (max === undefined) {
      return numValue >= min;
    }

    return numValue >= min && numValue <= max;
  }

  return false;
}
