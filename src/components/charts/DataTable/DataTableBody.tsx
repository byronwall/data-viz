import { DataTableSettings } from "@/types/ChartTypes";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { GroupRow } from "./components/GroupRow";

interface DataTableBodyProps {
  settings: DataTableSettings;
}

interface TableRow {
  id: string;
  [key: string]: any;
}

export function DataTableBody({ settings }: DataTableBodyProps) {
  const { columns, visibleColumns, selectedRows, groupBy } = settings;

  // TODO: Implement data fetching and filtering logic
  const data: TableRow[] = [];

  return (
    <TableBody>
      {data.map((row, index) => {
        const isGroupRow = groupBy.length > 0 && index === 0;

        if (isGroupRow) {
          return <GroupRow key={row.id} row={row} settings={settings} />;
        }

        return (
          <TableRow key={row.id}>
            <TableCell className="w-[50px]">
              <Checkbox
                checked={selectedRows.has(row.id)}
                onCheckedChange={() => {
                  // TODO: Implement row selection
                }}
              />
            </TableCell>
            {columns
              .filter((col) => visibleColumns.includes(col.id))
              .map((column) => (
                <TableCell key={column.id}>{row[column.field]}</TableCell>
              ))}
          </TableRow>
        );
      })}
    </TableBody>
  );
}
