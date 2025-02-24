import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useMemo, useState, useCallback, useEffect } from "react";
import { detectColumnType } from "../utils/dataTypeDetection";
import { calculateColumnStatistics } from "../utils/statisticsCalculator";
import {
  sampleData,
  estimateStatisticalSignificance,
} from "../utils/samplingStrategy";
import { ChartActions } from "./ChartActions";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

import { DataType } from "../utils/dataTypeDetection";
import { toast } from "sonner";

interface ColumnSummary {
  name: string;
  dataType: DataType | "unknown";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Progressive loading state
  const [processedColumns, setProcessedColumns] = useState<Set<string>>(
    new Set()
  );
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [columnSummaryData, setColumnSummaryData] = useState<
    Record<string, ColumnSummary>
  >({});

  const columnSummaries = useMemo(() => {
    const columnNames = getColumnNames();

    // Initialize processing queue if empty
    if (processingQueue.length === 0 && processedColumns.size === 0) {
      setProcessingQueue(columnNames);
    }

    return columnNames.map((columnName) => {
      // Return cached data if already processed
      if (columnSummaryData[columnName]) {
        return columnSummaryData[columnName];
      }

      // Return placeholder data for unprocessed columns
      return {
        name: columnName,
        dataType: "unknown" as const,
        totalCount: 0,
        uniqueCount: 0,
        nullCount: 0,
      };
    });
  }, [getColumnNames, processingQueue, processedColumns, columnSummaryData]);

  // Process columns progressively
  const processNextColumn = useCallback(async () => {
    if (processingQueue.length === 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);
    const columnName = processingQueue[0];

    try {
      // Simulate processing time for demonstration
      await new Promise((resolve) => setTimeout(resolve, 100));

      const columnData = getColumnData(columnName);
      const sampledData = useSampling
        ? sampleData(columnData, { method: "random", sampleSize })
        : columnData;
      const dataType = detectColumnType(sampledData);
      const statistics = calculateColumnStatistics(sampledData, dataType);

      setColumnSummaryData((prev) => ({
        ...prev,
        [columnName]: {
          name: columnName,
          ...statistics,
        },
      }));

      setProcessedColumns((prev) => new Set([...prev, columnName]));
      setProcessingQueue((prev) => prev.slice(1));

      const progress =
        ((processedColumns.size + 1) /
          (processedColumns.size + processingQueue.length)) *
        100;
      setProcessingProgress(progress);

      if (processingQueue.length === 1) {
        toast.success("Processing Complete");
      }
    } catch (error) {
      toast.error(`Error processing column ${columnName}`);
    } finally {
      setIsProcessing(false);
    }
  }, [
    processingQueue,
    isProcessing,
    processedColumns,
    getColumnData,
    useSampling,
    sampleSize,
  ]);

  // Process columns when queue changes
  useEffect(() => {
    if (processingQueue.length > 0) {
      processNextColumn();
    }
  }, [processingQueue, processNextColumn]);

  const handleSampleSizeChange = useCallback(
    (value: number[]) => {
      setSampleSize(value[0]);
      // Reset processing state to reanalyze with new sample size
      setProcessedColumns(new Set());
      setProcessingQueue(getColumnNames());
      setColumnSummaryData({});
      setProcessingProgress(0);
    },
    [getColumnNames]
  );

  const significance = useMemo(() => {
    if (!useSampling) {
      return null;
    }
    const totalSize = Object.keys(
      getColumnData(getColumnNames()[0] || "")
    ).length;
    return estimateStatisticalSignificance(sampleSize, totalSize);
  }, [useSampling, sampleSize, getColumnData, getColumnNames]);

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
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Badge variant={useSampling ? "default" : "outline"}>
            {useSampling ? "Sampling Enabled" : "Full Dataset"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setUseSampling(!useSampling);
              setProcessedColumns(new Set());
              setProcessingQueue(getColumnNames());
              setProcessingProgress(0);
            }}
          >
            Toggle Sampling
          </Button>
        </div>

        {useSampling && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Sample Size: {sampleSize}
              </span>
              {significance && (
                <span className="text-sm text-muted-foreground">
                  Margin of Error:{" "}
                  {(significance.marginOfError * 100).toFixed(2)}%
                </span>
              )}
            </div>
            <Slider
              value={[sampleSize]}
              min={100}
              max={10000}
              step={100}
              onValueChange={handleSampleSizeChange}
            />
          </div>
        )}

        {(isProcessing || processingQueue.length > 0) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Processing columns... {processedColumns.size} of{" "}
                {processedColumns.size + processingQueue.length}
              </span>
            </div>
            <Progress value={processingProgress} />
          </div>
        )}
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
                    dataType={
                      summary.dataType === "unknown"
                        ? "categorical"
                        : summary.dataType
                    }
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
