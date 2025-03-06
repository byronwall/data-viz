import { DataTableSettings } from "@/types/ChartTypes";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTablePaginationProps {
  settings: DataTableSettings;
}

export function DataTablePagination({ settings }: DataTablePaginationProps) {
  const { pageSize, currentPage } = settings;

  // TODO: Implement total count and page count
  const totalCount = 0;
  const pageCount = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            // TODO: Implement page size change
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {totalCount > 0
            ? `${(currentPage - 1) * pageSize + 1}-${Math.min(
                currentPage * pageSize,
                totalCount
              )} of ${totalCount}`
            : "0-0 of 0"}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => {
              // TODO: Implement previous page
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === pageCount}
            onClick={() => {
              // TODO: Implement next page
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
