import { calculatePivotData } from "@/components/charts/PivotTable/utils/calculations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useFacetAxis } from "@/providers/FacetAxisProvider";
import { BaseChartProps, PivotTableSettings } from "@/types/ChartTypes";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { PivotCell, PivotHeader, PivotRow } from "./types";
import { useGetLiveIds } from "../useGetLiveData";

type PivotTableProps = BaseChartProps & {
  settings: PivotTableSettings;
};

export function PivotTable({
  settings,
  width,
  height,
  facetIds,
}: PivotTableProps) {
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const updateChart = useDataLayer((state) => state.updateChart);

  const allLiveIds = useGetLiveIds(settings);

  // Get all required field data
  const pivotData = useMemo(() => {
    // Use facetIds if provided, otherwise use liveItems
    const liveIds = facetIds || allLiveIds;

    // Gather all required fields
    const allFields = new Set([
      ...settings.rowFields,
      ...settings.columnFields,
      ...settings.valueFields.map((f) => f.field),
    ]);

    // Get column data for each field
    const fieldData: Record<string, Record<string | number, any>> = {};
    allFields.forEach((field) => {
      fieldData[field] = getColumnData(field);
    });

    // Create data array for pivot calculations
    const data = liveIds.map((id) => {
      const row: Record<string, any> = {};
      allFields.forEach((field) => {
        row[field] = fieldData[field][id];
      });
      return row;
    });

    return calculatePivotData(data, settings);
  }, [facetIds, allLiveIds, settings, getColumnData]);

  const handleFilterClick = useCallback(
    (field: string, value: string | number) => {
      const isRowField = settings.rowFields.includes(field);
      const filterKey = isRowField ? "rowFilterValues" : "columnFilterValues";
      const currentFilters = settings[filterKey] || {};
      const fieldFilters = currentFilters[field] || [];

      // Toggle the value in the filter
      const newFieldFilters = fieldFilters.includes(value)
        ? fieldFilters.filter((v) => v !== value)
        : [...fieldFilters, value];

      const newFilters = {
        ...currentFilters,
        [field]: newFieldFilters,
      };

      updateChart(settings.id, {
        ...settings,
        [filterKey]: newFilters,
      });

      toast(
        `Filter ${newFieldFilters.length ? "applied" : "removed"} for ${field}`
      );
    },
    [settings, updateChart]
  );

  const handleCellClick = useCallback(
    (cell: PivotCell, rowKey: string, colKey: string) => {
      if (!cell.sourceRows) {
        return;
      }

      // TODO: Implement drill-down modal with source rows
      toast(
        `Showing details for ${cell.value} (${cell.sourceRows.length} rows)`
      );
    },
    []
  );

  const renderHeader = useCallback(
    (header: PivotHeader) => {
      return (
        <th
          key={`${header.field}-${header.value}`}
          colSpan={header.span * settings.valueFields.length}
          className={cn(
            "border p-2 bg-muted/50",
            header.depth === 0 && "font-semibold"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span>{header.label}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleFilterClick(header.field, header.value)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </th>
      );
    },
    [handleFilterClick, settings.valueFields.length]
  );

  // Calculate the number of header rows needed
  const headerDepth =
    settings.columnFields.length + (settings.columnFields.length > 0 ? 1 : 0);

  return (
    <div
      className={cn("w-full h-full border rounded-md flex flex-col")}
      style={{ height }}
    >
      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse relative">
          <thead className="sticky top-0 bg-background z-40">
            {/* First row: Row field headers and column field headers */}
            <tr>
              {/* Row field headers */}
              {settings.rowFields.map((field, i) => {
                const leftPosition = i * 150; // Match the body's width
                return (
                  <th
                    key={field}
                    rowSpan={headerDepth || 1}
                    className={cn(
                      "border p-2 bg-muted/50 font-semibold sticky",
                      // Add z-index that decreases as we go right to ensure proper layering
                      `z-[${30 - i}]` // Higher z-index than body to stay on top
                    )}
                    style={{
                      left: `${leftPosition}px`,
                      minWidth: "150px",
                      maxWidth: "150px",
                    }}
                  >
                    {field}
                  </th>
                );
              })}

              {/* Column headers or value fields if no columns */}
              {settings.columnFields.length === 0
                ? settings.valueFields.map((valueField) => (
                    <th
                      key={valueField.field}
                      className="border p-2 bg-muted/50 font-semibold"
                    >
                      {valueField.label ||
                        `${valueField.field} (${valueField.aggregation})`}
                    </th>
                  ))
                : pivotData.headers.map(renderHeader)}
            </tr>

            {/* Value field headers when column fields exist */}
            {settings.columnFields.length > 0 && (
              <tr>
                {/* Add empty cells for row headers to maintain alignment */}

                {pivotData.headers.flatMap((header: PivotHeader) =>
                  Array(header.span)
                    .fill(null)
                    .map((_, i) =>
                      settings.valueFields.map((valueField) => (
                        <th
                          key={`${header.field}-${header.value}-${valueField.field}-${i}`}
                          className="border p-2 bg-muted/50"
                        >
                          {valueField.label ||
                            `${valueField.field} (${valueField.aggregation})`}
                        </th>
                      ))
                    )
                )}
              </tr>
            )}
          </thead>
          <tbody>
            {pivotData.rows.map((row: PivotRow) => (
              <tr key={row.key}>
                {row.headers.map((header: PivotHeader, i) => {
                  // Calculate cumulative width of previous headers
                  const leftPosition = i * 150; // Using fixed width for consistency
                  return (
                    <th
                      key={`${header.field}-${header.value}`}
                      className={cn(
                        "border p-2 text-left font-normal sticky bg-white",
                        // Add z-index that decreases as we go right to ensure proper layering
                        `z-[${20 - i}]`
                      )}
                      style={{
                        left: `${leftPosition}px`,
                        minWidth: "150px", // Fixed width for consistency
                        maxWidth: "150px",
                      }}
                    >
                      {header.label}
                    </th>
                  );
                })}
                {row.cells.map((cell: PivotCell) => (
                  <td
                    key={cell.key}
                    className={cn(
                      "border p-2 text-right",
                      cell.sourceRows && "cursor-pointer hover:bg-muted/20"
                    )}
                    onClick={() =>
                      cell.sourceRows &&
                      handleCellClick(cell, row.key, cell.key)
                    }
                  >
                    {typeof cell.value === "number"
                      ? cell.value.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : cell.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
