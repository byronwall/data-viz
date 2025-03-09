import { Filter, RangeFilter } from "@/types/FilterTypes";

// Chart-specific helpers

export const getAxisFilter = (
  filters: Filter[],
  field: string
): RangeFilter | undefined => {
  return filters.find(
    (f): f is RangeFilter => f.type === "range" && f.field === field
  );
};
