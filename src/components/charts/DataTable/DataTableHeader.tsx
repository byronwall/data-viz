import { DataTableSettings } from "@/types/ChartTypes";
import { ColumnHeader } from "./components/ColumnHeader";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableHeaderProps {
  settings: DataTableSettings;
}

export function DataTableHeader({ settings }: DataTableHeaderProps) {
  const { columns, visibleColumns, sortConfig } = settings;

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]">
          <Checkbox />
        </TableHead>
        {columns
          .filter((col) => visibleColumns.includes(col.id))
          .map((column) => (
            <ColumnHeader
              key={column.id}
              column={column}
              sortConfig={sortConfig}
            />
          ))}
      </TableRow>
    </TableHeader>
  );
}
