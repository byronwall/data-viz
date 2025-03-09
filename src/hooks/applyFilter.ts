import { datum, Filter } from "@/types/FilterTypes";

export const applyFilter = (value: datum, filter: Filter): boolean => {
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
        switch (filter.operator) {
          case "contains":
            return value.includes(filter.value);
          case "equals":
            return value === filter.value;
          case "startsWith":
            return value.startsWith(filter.value);
          case "endsWith":
            return value.endsWith(filter.value);
        }
      }
  }

  return false;
};
