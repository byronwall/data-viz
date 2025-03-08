import {
  Filter,
  RangeFilter,
  TextFilter,
  ValueFilter,
  datum,
} from "@/types/FilterTypes";

export const createFilter = (
  type: "value" | "range" | "text",
  field: string,
  params: Partial<ValueFilter | RangeFilter | TextFilter>
): Filter => {
  switch (type) {
    case "value":
      return {
        type: "value",
        field,
        values: (params as Partial<ValueFilter>).values ?? [],
      };
    case "range":
      return {
        type: "range",
        field,
        min: (params as Partial<RangeFilter>).min,
        max: (params as Partial<RangeFilter>).max,
      };
    case "text":
      return {
        type: "text",
        field,
        operator: (params as Partial<TextFilter>).operator ?? "contains",
        value: (params as Partial<TextFilter>).value ?? "",
      };
  }
};

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

// Chart-specific helpers
export const getAxisFilter = (
  filters: Filter[],
  field: string
): RangeFilter | undefined => {
  return filters.find(
    (f): f is RangeFilter => f.type === "range" && f.field === field
  );
};

export const updateAxisFilter = (
  filters: Filter[],
  field: string,
  min?: number,
  max?: number
): Filter[] => {
  const existingFilterIndex = filters.findIndex(
    (f) => f.type === "range" && f.field === field
  );

  const newFilter: RangeFilter = {
    type: "range",
    field,
    min,
    max,
  };

  if (existingFilterIndex >= 0) {
    return [
      ...filters.slice(0, existingFilterIndex),
      newFilter,
      ...filters.slice(existingFilterIndex + 1),
    ];
  }

  return [...filters, newFilter];
};
