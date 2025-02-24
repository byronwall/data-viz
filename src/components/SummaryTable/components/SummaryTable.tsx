import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useMemo, useState } from "react";
import { detectColumnType } from "../utils/dataTypeDetection";
import { calculateColumnStatistics } from "../utils/statisticsCalculator";
import { sampleData } from "../utils/samplingStrategy";
import { ChartActions } from "./ChartActions";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ColumnSummary {
  name: string;
  dataType: "numeric" | "categorical" | "datetime" | "boolean";
  totalCount: number;
  uniqueCount: number;
  nullCount: number;
  statistics?: NumericStatistics;
  categories?: CategoryStatistics;
}

interface NumericStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
}

interface CategoryStatistics {
  topValues: Array<{ value: string; count: number }>;
  distribution: Record<string, number>;
}

type SortConfig = {
  column: keyof ColumnSummary | null;
  direction: "asc" | "desc";
};

export function SummaryTable() {
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: "asc",
  });
  const [useSampling, setUseSampling] = useState(true);
  const [sampleSize, setSampleSize] = useState(1000);

  const columnSummaries = useMemo(() => {
    const columnNames = getColumnNames();
    return columnNames.map((columnName) => {
      const columnData = getColumnData(columnName);
      const sampledData = useSampling
        ? sampleData(columnData, { method: "random", sampleSize })
        : columnData;
      const dataType = detectColumnType(sampledData);
      const statistics = calculateColumnStatistics(sampledData, dataType);

      return {
        name: columnName,
        ...statistics,
      } as ColumnSummary;
    });
  }, [getColumnData, getColumnNames, useSampling, sampleSize]);

  const sortedSummaries = useMemo(() => {
    if (!sortConfig.column) {
      return columnSummaries;
    }

    return [...columnSummaries].sort((a, b) => {
      const aValue = a[sortConfig.column as keyof ColumnSummary];
      const bValue = b[sortConfig.column as keyof ColumnSummary];

      if (aValue === bValue) {
        return 0;
      }
      if (aValue == null) {
        return 1;
      }
      if (bValue == null) {
        return -1;
      }

      // Handle different types of values
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      // Convert to strings for comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortConfig.direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [columnSummaries, sortConfig]);

  const handleSort = (column: keyof ColumnSummary) => {
    setSortConfig((current) => ({
      column,
      direction:
        current.column === column && current.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Badge variant={useSampling ? "default" : "outline"}>
          {useSampling ? "Sampling Enabled" : "Full Dataset"}
        </Badge>
        {useSampling && (
          <span className="text-sm text-muted-foreground">
            Sample Size: {sampleSize}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUseSampling(!useSampling)}
        >
          Toggle Sampling
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("name")}
                  className="h-8 text-left font-medium"
                >
                  Column
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("dataType")}
                  className="h-8 text-left font-medium"
                >
                  Type
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("totalCount")}
                  className="h-8 text-left font-medium"
                >
                  Total
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("uniqueCount")}
                  className="h-8 text-left font-medium"
                >
                  Unique
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("nullCount")}
                  className="h-8 text-left font-medium"
                >
                  Null
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Statistics</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSummaries.map((summary) => (
              <TableRow key={summary.name}>
                <TableCell className="font-medium">{summary.name}</TableCell>
                <TableCell>{summary.dataType}</TableCell>
                <TableCell>{summary.totalCount}</TableCell>
                <TableCell>{summary.uniqueCount}</TableCell>
                <TableCell>{summary.nullCount}</TableCell>
                <TableCell>
                  {summary.statistics && (
                    <span>
                      Min: {summary.statistics.min.toFixed(2)}, Max:{" "}
                      {summary.statistics.max.toFixed(2)}
                    </span>
                  )}
                  {summary.categories && (
                    <span>Top: {summary.categories.topValues[0]?.value}</span>
                  )}
                </TableCell>
                <TableCell>
                  <ChartActions
                    columnName={summary.name}
                    dataType={summary.dataType}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
