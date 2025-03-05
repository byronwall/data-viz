import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatumObject, useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";

interface ColumnInfo {
  name: string;
  type: "string" | "number" | "boolean";
}

export function SummaryChart({ settings }: BaseChartProps) {
  const { data, getColumnNames } = useDataLayer<
    DatumObject,
    { data: DatumObject[]; getColumnNames: () => string[] }
  >((state) => ({
    data: state.data,
    getColumnNames: state.getColumnNames,
  }));

  if (!data) {
    return null;
  }

  const columnInfo = getColumnNames().map((name: string) => {
    const sampleValue = data[0]?.[name];
    return {
      name,
      type: typeof sampleValue as "string" | "number" | "boolean",
    };
  });

  const numericColumns = columnInfo.filter(
    (col: ColumnInfo) => col.type === "number"
  );
  const categoricalColumns = columnInfo.filter(
    (col: ColumnInfo) => col.type === "string"
  );

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>{settings.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Dataset Overview</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total Rows</TableCell>
                    <TableCell>{data.length}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Columns</TableCell>
                    <TableCell>{columnInfo.length}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Column Types</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columnInfo.map((col: ColumnInfo) => (
                    <TableRow key={col.name}>
                      <TableCell>{col.name}</TableCell>
                      <TableCell>{col.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {numericColumns.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Numeric Column Statistics
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Min</TableHead>
                      <TableHead>Max</TableHead>
                      <TableHead>Mean</TableHead>
                      <TableHead>Median</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {numericColumns.map((col: ColumnInfo) => {
                      const values = data
                        .map((row: DatumObject) => row[col.name])
                        .filter(
                          (v: unknown): v is number => typeof v === "number"
                        );
                      const min = Math.min(...values);
                      const max = Math.max(...values);
                      const mean =
                        values.reduce((a, b) => a + b, 0) / values.length;
                      const sorted = [...values].sort((a, b) => a - b);
                      const median = sorted[Math.floor(sorted.length / 2)];

                      return (
                        <TableRow key={col.name}>
                          <TableCell>{col.name}</TableCell>
                          <TableCell>{min.toFixed(2)}</TableCell>
                          <TableCell>{max.toFixed(2)}</TableCell>
                          <TableCell>{mean.toFixed(2)}</TableCell>
                          <TableCell>{median.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {categoricalColumns.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Categorical Column Statistics
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Unique Values</TableHead>
                      <TableHead>Most Common</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoricalColumns.map((col: ColumnInfo) => {
                      const values = data.map(
                        (row: DatumObject) => row[col.name]
                      );
                      const uniqueValues = new Set(values);
                      const valueCounts = values.reduce(
                        (acc: Record<string, number>, val: unknown) => {
                          acc[String(val)] = (acc[String(val)] || 0) + 1;
                          return acc;
                        },
                        {}
                      );
                      const mostCommon = Object.entries(valueCounts).sort(
                        ([, a], [, b]) => b - a
                      )[0];

                      return (
                        <TableRow key={col.name}>
                          <TableCell>{col.name}</TableCell>
                          <TableCell>{uniqueValues.size}</TableCell>
                          <TableCell>
                            {mostCommon
                              ? `${mostCommon[0]} (${mostCommon[1]})`
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
