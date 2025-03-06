import { DataTableSettings } from "@/types/ChartTypes";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GroupRowProps {
  row: {
    id: string;
    groupValue: string;
    count: number;
  };
  settings: DataTableSettings;
}

export function GroupRow({ row, settings }: GroupRowProps) {
  const { expandedGroups } = settings;
  const isExpanded = expandedGroups.has(row.id);

  return (
    <TableRow className="bg-muted/50">
      <TableCell colSpan={settings.visibleColumns.length + 1}>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => {
            // TODO: Implement group expansion
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="font-medium">{row.groupValue}</span>
          <span className="text-muted-foreground">({row.count})</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}
