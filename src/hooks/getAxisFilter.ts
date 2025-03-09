import { Filter, RangeFilter } from "@/types/FilterTypes";

export function getAxisFilter(
  filters: Filter[],
  field: string
): RangeFilter | undefined {
  return filters.find(
    (f): f is RangeFilter => f.type === "range" && f.field === field
  );
}
