import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { DataTableSettings } from "@/types/ChartTypes";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import React, { useState } from "react";
import { ColumnFilter } from "./components/ColumnFilter";

interface DataTableHeaderProps {
  settings: DataTableSettings;
}

export function DataTableHeader({ settings }: DataTableHeaderProps) {
  const { columns, sortBy, sortDirection, filters } = settings;

  const updateChart = useDataLayer((state) => state.updateChart);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [resizingColumn, setResizingColumn] = React.useState<string | null>(
    null
  );
  const [startX, setStartX] = React.useState(0);
  const [startWidth, setStartWidth] = React.useState(0);
  const [tempWidths, setTempWidths] = React.useState<Record<string, number>>(
    {}
  );

  // Get filtered data from liveItems

  const handleResizeStart = (e: React.MouseEvent, columnId: string) => {
    setResizingColumn(columnId);
    setStartX(e.clientX);
    const column = settings.columns.find((col) => col.id === columnId);
    setStartWidth(column?.width || 100);
  };

  const handleResizeMove = React.useCallback(
    (e: MouseEvent) => {
      if (!resizingColumn) {
        return;
      }

      const diff = e.clientX - startX;
      const newWidth = Math.max(10, startWidth + diff);

      setTempWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    },
    [resizingColumn, startX, startWidth]
  );

  const handleResizeEnd = React.useCallback(() => {
    if (!resizingColumn) {
      return;
    }

    const finalWidth = tempWidths[resizingColumn];
    if (finalWidth) {
      updateChart(settings.id, {
        ...settings,
        columns: settings.columns.map((col) =>
          col.id === resizingColumn ? { ...col, width: finalWidth } : col
        ),
      });
    }

    setResizingColumn(null);
    setTempWidths({});
  }, [resizingColumn, tempWidths, settings, updateChart]);

  React.useEffect(() => {
    if (resizingColumn) {
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [resizingColumn, handleResizeMove, handleResizeEnd]);

  const handleSort = (columnId: string) => {
    const newDirection =
      sortBy === columnId && sortDirection === "asc" ? "desc" : "asc";

    updateChart(settings.id, {
      ...settings,
      sortBy: columnId,
      sortDirection: newDirection,
    });
  };

  const handleFilterChange = (
    columnId: string,
    value: string,
    operator: (typeof filters)[string]["operator"]
  ) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters[columnId] = { value, operator };
    } else {
      delete newFilters[columnId];
    }
    updateChart(settings.id, { filters: newFilters });
  };

  const handleFilterClear = (columnId: string) => {
    const newFilters = { ...filters };
    delete newFilters[columnId];
    updateChart(settings.id, { filters: newFilters });
  };

  return (
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
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
                  setActiveFilter(activeFilter === column.id ? null : column.id)
                }
              >
                <Filter className="h-4 w-4" />
              </Button>
              {activeFilter === column.id && (
                <ColumnFilter
                  columnId={column.id}
                  columnLabel={column.id}
                  value={filters[column.id]?.value || ""}
                  operator={filters[column.id]?.operator || "contains"}
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
        ))}
      </TableRow>
    </TableHeader>
  );
}
