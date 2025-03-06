import { DataTableSettings } from "@/types/ChartTypes";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface DataTableGroupingProps {
  settings: DataTableSettings;
}

export function DataTableGrouping({ settings }: DataTableGroupingProps) {
  const { groupBy, columns } = settings;

  if (groupBy.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <span className="text-sm text-muted-foreground">Grouped by:</span>
      {groupBy.map((field) => {
        const column = columns.find((col) => col.field === field);
        if (!column) {
          return null;
        }

        return (
          <div
            key={field}
            className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md"
          >
            <span className="text-sm">{column.label}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              onClick={() => {
                // TODO: Implement remove grouping
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
      <Select
        value=""
        onValueChange={(value) => {
          // TODO: Implement add grouping
        }}
      >
        <SelectTrigger className="h-8 w-[180px]">
          <SelectValue placeholder="Add grouping" />
        </SelectTrigger>
        <SelectContent>
          {columns
            .filter((col) => !groupBy.includes(col.field))
            .map((column) => (
              <SelectItem key={column.id} value={column.field}>
                {column.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
