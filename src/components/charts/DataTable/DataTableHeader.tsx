import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { DataTableSettings } from "@/types/ChartTypes";
import { ChevronDown, ChevronUp, Filter as FilterIcon } from "lucide-react";
import React, { useState } from "react";
import { ColumnFilter } from "./components/ColumnFilter";
import { Filter, TextFilter } from "@/types/FilterTypes";

interface DataTableHeaderProps {
  settings: DataTableSettings;
}

export function DataTableHeader({ settings }: DataTableHeaderProps) {
  const { columns, sortBy, sortDirection, filters } = settings;
  const updateChart = useDataLayer((state) => state.updateChart);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [tempWidths, setTempWidths] = useState<Record<string, number>>({});

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      // Toggle sort direction
      updateChart(settings.id, {
        sortDirection: sortDirection === "asc" ? "desc" : "asc",
      });
    } else {
      // Set new sort column
      updateChart(settings.id, {
        sortBy: columnId,
        sortDirection: "asc",
      });
    }
  };

  const handleFilterChange = (
    columnId: string,
    value: string,
    operator: TextFilter["operator"]
  ) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column) {
      return;
    }

    // Create new filters array with updated text filter
    const newFilters = filters.filter(
      (f: Filter) => f.type !== "text" || f.field !== column.field
    );

    if (value) {
      const textFilter: TextFilter = {
        type: "text",
        field: column.field,
        operator,
        value,
      };
      newFilters.push(textFilter);
    }

    updateChart(settings.id, {
      filters: newFilters,
    });
  };

  const handleFilterClear = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column) {
      return;
    }

    // Remove text filter for this column
    const newFilters = filters.filter(
      (f: Filter) => f.type !== "text" || f.field !== column.field
    );

    updateChart(settings.id, {
      filters: newFilters,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    setResizingColumn(columnId);

    const startX = e.pageX;
    const column = columns.find((col) => col.id === columnId);
    const startWidth = column?.width || 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingColumn) {
        return;
      }

      const diff = e.pageX - startX;
      const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px
      setTempWidths((prev) => ({ ...prev, [columnId]: newWidth }));
    };

    const handleMouseUp = () => {
      if (!resizingColumn) {
        return;
      }

      const newWidth = tempWidths[columnId];
      if (newWidth) {
        const newColumns = columns.map((col) =>
          col.id === columnId ? { ...col, width: newWidth } : col
        );
        updateChart(settings.id, { columns: newColumns });
      }

      setResizingColumn(null);
      setTempWidths({});
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <TableHeader>
      <TableRow>
        {columns.map((column) => {
          const textFilter = filters.find(
            (f: Filter): f is TextFilter =>
              f.type === "text" && f.field === column.field
          );

          return (
            <TableHead
              key={column.id}
              className="relative select-none"
              style={{
                width:
                  resizingColumn === column.id
                    ? tempWidths[column.id] || column.width
                    : column.width,
              }}
            >
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleSort(column.id)}
              >
                {column.field}
                {sortBy === column.id &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() =>
                    setActiveFilter(
                      activeFilter === column.id ? null : column.id
                    )
                  }
                >
                  <FilterIcon className="h-4 w-4" />
                </Button>
                {activeFilter === column.id && (
                  <ColumnFilter
                    columnId={column.id}
                    columnLabel={column.id}
                    value={textFilter?.value || ""}
                    operator={textFilter?.operator || "contains"}
                    onChange={handleFilterChange}
                    onClear={() => handleFilterClear(column.id)}
                  />
                )}
              </div>
              <div
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary"
                onMouseDown={(e) => handleResizeStart(e, column.id)}
              />
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}
