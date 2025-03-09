import { datum, Filter } from "@/types/FilterTypes";

export function applyFilter(value: datum, filter: Filter): boolean {
  switch (filter.type) {
    case "value":
      return filter.values.includes(value as string | number);
    case "range":
      if (typeof value === "number") {
        return (
          (filter.min === undefined || value >= filter.min) &&
          (filter.max === undefined || value <= filter.max)
        );
      }
      break;
    case "text":
      if (typeof value === "string") {
        const lower = value.toLowerCase();
        const search = filter.value.toLowerCase();

        switch (filter.operator) {
          case "contains":
            return lower.includes(search);
          case "equals":
            return lower === search;
          case "startsWith":
            return lower.startsWith(search);
          case "endsWith":
            return lower.endsWith(search);
        }
      }
  }

  return false;
}
