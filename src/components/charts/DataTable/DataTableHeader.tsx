import { DataTableSettings } from "@/types/ChartTypes";
import { ColumnHeader } from "./components/ColumnHeader";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ArrowUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnFilter } from "./components/ColumnFilter";
import { useState } from "react";

interface DataTableHeaderProps {
  settings: DataTableSettings;
}

export function DataTableHeader({ settings }: DataTableHeaderProps) {
  const { columns, sortBy, sortDirection, filters } = settings;
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));
  const updateChart = useDataLayer((state) => state.updateChart);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Get filtered data from liveItems
  const filteredData =
    liveItems?.items
      .filter((item) => item.value > 0)
      .map((item) => data.find((row) => row.__ID === item.key))
      .filter(
        (row): row is { __ID: number; [key: string]: any } => row !== undefined
      ) || [];

  const handleSelectAll = () => {
    const newSelectedRows = new Set<string>();
    if (filteredData.length > 0) {
      filteredData.forEach((row) => newSelectedRows.add(String(row.__ID)));
    }
    updateChart(settings.id, { selectedRows: newSelectedRows });
  };

  const handleSort = (columnId: string) => {
    const newSortDirection: "asc" | "desc" =
      sortBy === columnId && sortDirection === "asc" ? "desc" : "asc";
    updateChart(settings.id, {
      sortBy: columnId,
      sortDirection: newSortDirection,
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
        <TableHead className="w-12">
          <Checkbox
            checked={filteredData.length > 0}
            onCheckedChange={handleSelectAll}
          />
        </TableHead>
        {columns.map((column) => (
          <TableHead key={column.id}>
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleSort(column.id)}
              >
                {column.label}
                {sortBy === column.id ? (
                  <ArrowUpDown
                    className={`h-4 w-4 ${
                      sortDirection === "desc" ? "rotate-180" : ""
                    }`}
                  />
                ) : (
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                )}
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() =>
                    setActiveFilter(
                      activeFilter === column.id ? null : column.id
                    )
                  }
                >
                  <Filter
                    className={`h-3 w-3 ${
                      filters[column.id] ? "text-primary" : "text-gray-400"
                    }`}
                  />
                </Button>
                {activeFilter === column.id && (
                  <ColumnFilter
                    columnId={column.id}
                    columnLabel={column.label}
                    value={filters[column.id]?.value || ""}
                    operator={filters[column.id]?.operator || "contains"}
                    onChange={handleFilterChange}
                    onClear={() => handleFilterClear(column.id)}
                  />
                )}
              </div>
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
