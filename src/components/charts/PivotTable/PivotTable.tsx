import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps, PivotTableSettings } from "@/types/ChartTypes";
import { Search } from "lucide-react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { PivotCell, PivotHeader, PivotRow } from "./types";
import { calculatePivotData } from "./utils/calculations";

type PivotTableProps = BaseChartProps & {
  settings: PivotTableSettings;
};

export function PivotTable({ settings, width, height }: PivotTableProps) {
  console.log("Pivot Table Settings:", settings);

  const liveItems = useDataLayer((state) => state.getLiveItems(settings));
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const updateChart = useDataLayer((state) => state.updateChart);

  // Get all required field data
  const pivotData = useMemo(() => {
    const liveIds = liveItems.items
      .filter((c) => c.value > 0)
      .map((d) => d.key);

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
  }, [liveItems, getColumnData, settings]);

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
          colSpan={header.span}
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
          {header.children && (
            <tr>{header.children.map((child) => renderHeader(child))}</tr>
          )}
        </th>
      );
    },
    [handleFilterClick]
  );

  return (
    <div className={cn("w-full h-full overflow-auto border rounded-md")}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {/* Add headers for row fields */}
            {settings.rowFields.map((field) => (
              <th key={field} className="border p-2 bg-muted/50 font-semibold">
                {field}
              </th>
            ))}
            {/* Show value field headers if no column fields */}
            {settings.columnFields.length === 0 &&
              settings.valueFields.map((valueField) => (
                <th
                  key={valueField.field}
                  className="border p-2 bg-muted/50 font-semibold"
                >
                  {valueField.label ||
                    `${valueField.field} (${valueField.aggregation})`}
                </th>
              ))}
            {/* Show column headers if they exist */}
            {pivotData.headers.map(renderHeader)}
          </tr>
        </thead>
        <tbody>
          {pivotData.rows.map((row: PivotRow) => (
            <tr key={row.key} className={cn(row.subtotal && "bg-muted/20")}>
              {row.headers.map((header: PivotHeader) => (
                <th
                  key={`${header.field}-${header.value}`}
                  className="border p-2 text-left font-normal"
                >
                  {header.label}
                </th>
              ))}
              {row.cells.map((cell: PivotCell) => (
                <td
                  key={cell.key}
                  className={cn(
                    "border p-2 text-right",
                    cell.sourceRows && "cursor-pointer hover:bg-muted/20"
                  )}
                  onClick={() =>
                    cell.sourceRows && handleCellClick(cell, row.key, cell.key)
                  }
                >
                  {cell.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
