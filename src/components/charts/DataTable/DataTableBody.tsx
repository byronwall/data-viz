import { DataTableSettings } from "@/types/ChartTypes";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { GroupRow } from "./components/GroupRow";
import { Checkbox } from "@/components/ui/checkbox";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { IdType } from "@/providers/DataLayerProvider";

interface DataTableBodyProps {
  settings: DataTableSettings;
}

type GroupData = {
  key: string;
  count: number;
  rows: Array<{
    __ID: IdType;
    [key: string]: any;
  }>;
};

type DataRow = {
  __ID: IdType;
  [key: string]: any;
};

export function DataTableBody({ settings }: DataTableBodyProps) {
  const { pageSize, currentPage, sortBy, sortDirection, filters } = settings;
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));
  const selectedRows = new Set<string>();
  const updateChart = useDataLayer((state) => state.updateChart);

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

  // Group data if groupBy is set
  const groupedData = settings.groupBy
    ? sortedData.reduce<GroupData[]>((acc, row) => {
        const groupKey = row[settings.groupBy!] as string;
        const existingGroup = acc.find((g) => g.key === groupKey);
        if (existingGroup) {
          existingGroup.count++;
          existingGroup.rows.push(row);
        } else {
          acc.push({ key: groupKey, count: 1, rows: [row] });
        }
        return acc;
      }, [])
    : [];

  // Sort groups by count
  groupedData.sort((a, b) => b.count - a.count);

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Get paginated data
  const paginatedData = settings.groupBy
    ? groupedData.slice(startIndex, endIndex)
    : sortedData.slice(startIndex, endIndex);

  const handleRowSelection = (id: string) => {
    // const newSelectedRows = new Set(selectedRows);
    // if (newSelectedRows.has(id)) {
    //   newSelectedRows.delete(id);
    // } else {
    //   newSelectedRows.add(id);
    // }
    // updateChart(settings.id, { selectedRows: newSelectedRows });
  };

  console.log("DataTableBody", paginatedData);

  return (
    <TableBody>
      {settings.groupBy
        ? (paginatedData as GroupData[]).map((group) => (
            <GroupRow
              key={group.key}
              groupKey={group.key}
              groupCount={group.count}
              rows={group.rows}
              settings={settings}
              onRowSelect={handleRowSelection}
            />
          ))
        : (paginatedData as DataRow[]).map((row) => (
            <TableRow key={String(row.__ID)}>
              <TableCell className="w-12">
                <Checkbox
                  checked={selectedRows.has(String(row.__ID))}
                  onCheckedChange={() => handleRowSelection(String(row.__ID))}
                />
              </TableCell>
              {settings.columns.map((column) => (
                <TableCell key={column.id}>{row[column.id]}</TableCell>
              ))}
            </TableRow>
          ))}
    </TableBody>
  );
}
