import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useMemo } from "react";
import { detectColumnType } from "../utils/dataTypeDetection";
import { calculateColumnStatistics } from "../utils/statisticsCalculator";
import { ChartActions } from "./ChartActions";

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

export function SummaryTable() {
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getColumnNames = useDataLayer((state) => state.getColumnNames);

  const columnSummaries = useMemo(() => {
    const columnNames = getColumnNames();
    return columnNames.map((columnName) => {
      const columnData = getColumnData(columnName);
      const dataType = detectColumnType(columnData);
      const statistics = calculateColumnStatistics(columnData, dataType);

      return {
        name: columnName,
        ...statistics,
      } as ColumnSummary;
    });
  }, [getColumnData, getColumnNames]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Column</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Unique</TableHead>
            <TableHead>Null</TableHead>
            <TableHead>Statistics</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {columnSummaries.map((summary) => (
            <TableRow key={summary.name}>
              <TableCell className="font-medium">{summary.name}</TableCell>
              <TableCell>{summary.dataType}</TableCell>
              <TableCell>{summary.totalCount}</TableCell>
              <TableCell>{summary.uniqueCount}</TableCell>
              <TableCell>{summary.nullCount}</TableCell>
              <TableCell>
                {summary.statistics && (
                  <span>
                    Min: {summary.statistics.min}, Max: {summary.statistics.max}
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
  );
}
