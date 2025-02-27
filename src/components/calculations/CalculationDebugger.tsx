import { useState } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Bug, Eye, RefreshCw } from "lucide-react";

export function CalculationDebugger() {
  const calculations = useDataLayer((state) => state.calculations);
  const data = useDataLayer((state) => state.data);
  const getCalculationResultForRow = useDataLayer(
    (state) => state.getCalculationResultForRow
  );

  const [selectedCalculation, setSelectedCalculation] = useState<string | null>(
    null
  );
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("dependencies");

  // Get the selected calculation
  const calculation = calculations.find(
    (calc) => calc.resultColumnName === selectedCalculation
  );

  // Get sample row IDs (first 10)
  const sampleRowIds = data.slice(0, 10).map((row) => row.__ID);

  // Get dependencies for the selected calculation
  const dependencies = calculation?.expression.dependencies || [];

  // Get the result for the selected row
  const rowResult =
    selectedCalculation && selectedRowId !== null
      ? getCalculationResultForRow(selectedCalculation, selectedRowId)
      : null;

  // Get the row data for the selected row
  const rowData =
    selectedRowId !== null
      ? data.find((row) => row.__ID === selectedRowId)
      : null;

  // Get dependency values for the selected row
  const dependencyValues =
    rowData && dependencies.length > 0
      ? dependencies.map((dep) => ({
          name: dep,
          value: rowData[dep],
        }))
      : [];

  // Simulate execution steps (this would be replaced with actual execution steps)
  const executionSteps = calculation
    ? [
        {
          step: 1,
          description: "Parse expression",
          details: `Parsing: ${calculation.expression.expression}`,
        },
        {
          step: 2,
          description: "Resolve dependencies",
          details: `Dependencies: ${dependencies.join(", ")}`,
        },
        {
          step: 3,
          description: "Evaluate expression",
          details: "Applying calculation logic",
        },
        {
          step: 4,
          description: "Store result",
          details: `Result stored in column: ${calculation.resultColumnName}`,
        },
      ]
    : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Calculation Debugger
            </CardTitle>
            <CardDescription>
              Debug and inspect calculation execution
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedCalculation || ""}
              onValueChange={setSelectedCalculation}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select calculation" />
              </SelectTrigger>
              <SelectContent>
                {calculations.map((calc) => (
                  <SelectItem
                    key={calc.resultColumnName}
                    value={calc.resultColumnName}
                  >
                    {calc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCalculation && (
              <Select
                value={selectedRowId?.toString() || ""}
                onValueChange={(value) => setSelectedRowId(Number(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select row" />
                </SelectTrigger>
                <SelectContent>
                  {sampleRowIds.map((id) => (
                    <SelectItem key={id} value={id.toString()}>
                      Row {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedCalculation ? (
          <div className="text-center py-8 text-muted-foreground">
            Select a calculation to debug
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-md">
              <div className="font-medium mb-1">Expression</div>
              <div className="font-mono text-sm">
                {calculation?.expression.expression}
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                <TabsTrigger value="execution">Execution Flow</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>

              <TabsContent value="dependencies" className="space-y-4">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dependency</TableHead>
                        <TableHead>Type</TableHead>
                        {selectedRowId !== null && (
                          <TableHead>Value for Row {selectedRowId}</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dependencies.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={selectedRowId !== null ? 3 : 2}
                            className="text-center text-muted-foreground"
                          >
                            No dependencies found
                          </TableCell>
                        </TableRow>
                      ) : (
                        dependencies.map((dep) => {
                          const depValue = dependencyValues.find(
                            (d) => d.name === dep
                          );
                          return (
                            <TableRow key={dep}>
                              <TableCell className="font-mono">{dep}</TableCell>
                              <TableCell>
                                {typeof rowData?.[dep] === "number"
                                  ? "Number"
                                  : typeof rowData?.[dep] === "string"
                                  ? "String"
                                  : typeof rowData?.[dep] === "boolean"
                                  ? "Boolean"
                                  : rowData &&
                                    rowData[dep] &&
                                    typeof rowData[dep] === "object" &&
                                    "getMonth" in rowData[dep]
                                  ? "Date"
                                  : "Unknown"}
                              </TableCell>
                              {selectedRowId !== null && (
                                <TableCell>
                                  {depValue
                                    ? JSON.stringify(depValue.value)
                                    : "N/A"}
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Dependency Graph</h4>
                  <div className="bg-muted p-4 rounded-md flex items-center justify-center min-h-[150px]">
                    {dependencies.length === 0 ? (
                      <div className="text-muted-foreground">
                        No dependencies to display
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 items-center justify-center">
                        {dependencies.map((dep, index) => (
                          <div key={dep} className="flex items-center">
                            <Badge variant="outline" className="font-mono">
                              {dep}
                            </Badge>
                            {index < dependencies.length - 1 && (
                              <ArrowRight className="h-4 w-4 mx-1" />
                            )}
                          </div>
                        ))}
                        <ArrowRight className="h-4 w-4 mx-1" />
                        <Badge className="bg-primary text-primary-foreground font-mono">
                          {calculation?.resultColumnName}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="execution">
                <ScrollArea className="h-[300px] border rounded-md">
                  <div className="p-4 space-y-4">
                    {executionSteps.map((step) => (
                      <div
                        key={step.step}
                        className="border rounded-md p-3 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">Step {step.step}</Badge>
                          <span className="font-medium">
                            {step.description}
                          </span>
                        </div>
                        <div className="text-sm bg-muted p-2 rounded">
                          {step.details}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="results">
                {selectedRowId === null ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a row to view results
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm font-medium mb-2">
                        Input Values (Row {selectedRowId})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {dependencyValues.map((dep) => (
                          <div
                            key={dep.name}
                            className="flex justify-between bg-muted p-2 rounded"
                          >
                            <span className="font-mono text-sm">
                              {dep.name}:
                            </span>
                            <span className="font-mono text-sm">
                              {JSON.stringify(dep.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border rounded-md p-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Result
                      </h4>
                      <div className="bg-muted p-3 rounded font-mono text-sm">
                        {rowResult !== undefined
                          ? JSON.stringify(rowResult)
                          : "No result available"}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Recalculate
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
