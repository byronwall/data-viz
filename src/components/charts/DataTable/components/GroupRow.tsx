import { DataTableSettings } from "@/types/ChartTypes";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { IdType } from "@/providers/DataLayerProvider";

interface GroupRowProps {
  groupKey: string;
  groupCount: number;
  rows: Array<{
    __ID: IdType;
    [key: string]: any;
  }>;
  settings: DataTableSettings;
  onRowSelect: (id: string) => void;
}

export function GroupRow({
  groupKey,
  groupCount,
  rows,
  settings,
  onRowSelect,
}: GroupRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleGroupSelect = (checked: boolean) => {
    rows.forEach((row) => onRowSelect(String(row.__ID)));
  };

  return (
    <>
      <TableRow>
        <TableCell className="w-12">
          <Checkbox
            checked={rows.every((row) => onRowSelect(String(row.__ID)))}
            onCheckedChange={handleGroupSelect}
          />
        </TableCell>
        <TableCell colSpan={settings.columns.length}>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>
            <span className="font-medium">
              {groupKey} ({groupCount})
            </span>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded &&
        rows.map((row) => (
          <TableRow key={String(row.__ID)}>
            <TableCell className="w-12">
              <Checkbox
                checked={onRowSelect(String(row.__ID))}
                onCheckedChange={() => onRowSelect(String(row.__ID))}
              />
            </TableCell>
            {settings.columns.map((column) => (
              <TableCell key={column.id}>{row[column.id]}</TableCell>
            ))}
          </TableRow>
        ))}
    </>
  );
}
