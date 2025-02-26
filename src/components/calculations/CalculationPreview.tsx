import React from "react";
import { type Expression } from "@/lib/calculations/types";
import { Calculator } from "@/lib/calculations/engine/Calculator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface CalculationPreviewProps {
  expression: Expression;
  data: any[];
  previewRows?: number;
}

export function CalculationPreview({
  expression,
  data,
  previewRows = 5,
}: CalculationPreviewProps) {
  const calculator = new Calculator({ data, variables: {} });
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const evaluate = async () => {
      try {
        const calculationResult = await calculator.evaluate(expression);
        if (calculationResult.success) {
          setResult(calculationResult.value);
          setError(null);
        } else {
          setError(calculationResult.error || "Unknown error");
          setResult(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setResult(null);
      }
    };

    evaluate();
  }, [expression, data]);

  const previewData = data.slice(0, previewRows);

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Calculation Preview</h3>
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Result</h4>
            <pre className="bg-muted p-2 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Preview Data</h4>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    {expression.dependencies.map((dep) => (
                      <TableHead key={dep}>{dep}</TableHead>
                    ))}
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      {expression.dependencies.map((dep) => (
                        <TableCell key={dep}>{row[dep]}</TableCell>
                      ))}
                      <TableCell>
                        {result && result[index] !== undefined
                          ? JSON.stringify(result[index])
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {data.length > previewRows && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing {previewRows} of {data.length} rows
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
