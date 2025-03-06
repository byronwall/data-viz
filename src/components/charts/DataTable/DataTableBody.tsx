import { DataTableSettings } from "@/types/ChartTypes";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { IdType } from "@/providers/DataLayerProvider";

interface DataTableBodyProps {
  settings: DataTableSettings;
}

export function DataTableBody({ settings }: DataTableBodyProps) {
  const { pageSize, currentPage, sortBy, sortDirection, filters } = settings;
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

  // Apply filters
  const filteredByColumns = Object.entries(filters).reduce(
    (acc, [columnId, filter]) => {
      return acc.filter((row) => {
        const value = String(row[columnId]).toLowerCase();
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
    },
    filteredData
  );

  // Sort data if sortBy is set
  const sortedData = sortBy
    ? [...filteredByColumns].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        if (aValue === bValue) {
          return 0;
        }
        if (aValue === null || aValue === undefined) {
          return 1;
        }
        if (bValue === null || bValue === undefined) {
          return -1;
        }
        const comparison = aValue < bValue ? -1 : 1;
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
            <TableCell key={column.id}>{row[column.id]}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
