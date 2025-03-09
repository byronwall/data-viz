import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { IdType, useDataLayer } from "@/providers/DataLayerProvider";
import { DataTableSettings } from "@/types/ChartTypes";
import { isTextFilter } from "@/types/FilterTypes";

interface DataTableBodyProps {
  settings: DataTableSettings;
}

// Helper function to check if a value is numeric
function isNumeric(value: any): boolean {
  if (typeof value === "number") {
    return true;
  }
  if (typeof value !== "string") {
    return false;
  }
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

// Helper function to compare values with natural sort
function compareValues(a: any, b: any): number {
  // Handle null/undefined values
  if (a === null || a === undefined) {
    return 1;
  }
  if (b === null || b === undefined) {
    return -1;
  }
  if (a === b) {
    return 0;
  }

  // Convert to strings for comparison if not numeric
  const aStr = String(a);
  const bStr = String(b);

  // If both values are numeric, compare as numbers
  if (isNumeric(a) && isNumeric(b)) {
    return Number(a) - Number(b);
  }

  // For strings, use localeCompare for natural sort
  return aStr.localeCompare(bStr);
}

// Helper function to check if a row matches the global search
function matchesGlobalSearch(
  row: Record<string, any>,
  searchTerm: string
): boolean {
  if (!searchTerm) {
    return true;
  }
  const searchLower = searchTerm.toLowerCase();

  return Object.values(row).some((value) => {
    if (value === null || value === undefined) {
      return false;
    }
    const strValue = String(value).toLowerCase();
    return strValue.includes(searchLower);
  });
}

export function DataTableBody({ settings }: DataTableBodyProps) {
  const {
    pageSize,
    currentPage,
    sortBy,
    sortDirection,
    filters,
    globalSearch,
  } = settings;
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));

  // Get filtered data from liveItems
  const filteredData =
    liveItems?.items
      .filter((item) => item.value > 0)
      .map((item) => data.find((row) => row.__ID === item.key))
      .filter(
        (row): row is { __ID: IdType; [key: string]: any } => row !== undefined
      ) || [];

  // Apply global search
  const searchFilteredData = globalSearch
    ? filteredData.filter((row) => matchesGlobalSearch(row, globalSearch))
    : filteredData;

  // Apply column filters
  const filteredByColumns = searchFilteredData.filter((row) => {
    // Get all text filters
    const textFilters = filters.filter(isTextFilter);

    // If no text filters, return true
    if (textFilters.length === 0) {
      return true;
    }

    // Check if row matches all text filters
    return textFilters.every((filter) => {
      const cellValue = row[filter.field];
      if (cellValue === null || cellValue === undefined) {
        return false;
      }

      const value = String(cellValue).toLowerCase();
      const filterValue = filter.value.toLowerCase();

      switch (filter.operator) {
        case "contains":
          return value.includes(filterValue);
        case "equals":
          return value === filterValue;
        case "startsWith":
          return value.startsWith(filterValue);
        case "endsWith":
          return value.endsWith(filterValue);
        default:
          return true;
      }
    });
  });

  // Sort data if sortBy is set
  const sortedData = sortBy
    ? [...filteredByColumns].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        const comparison = compareValues(aValue, bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : filteredByColumns;

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Get paginated data
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return (
    <TableBody>
      {paginatedData.map((row) => (
        <TableRow key={String(row.__ID)}>
          {settings.columns.map((column) => (
            <TableCell key={column.id} style={{ width: column.width }}>
              {row[column.id]}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
