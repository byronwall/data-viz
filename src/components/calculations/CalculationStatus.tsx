import { useState, useEffect } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CalculationStatusProps {
  onRefresh?: () => void;
}

export function CalculationStatus({ onRefresh }: CalculationStatusProps) {
  const calculations = useDataLayer((state) => state.calculations);
  const executeCalculations = useDataLayer(
    (state) => state.executeCalculations
  );

  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [lastExecuted, setLastExecuted] = useState<Date | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const activeCalculations = calculations.filter((calc) => calc.isActive);
  const inactiveCalculations = calculations.filter((calc) => !calc.isActive);

  const handleRefresh = async () => {
    if (isExecuting) {
      return;
    }

    setIsExecuting(true);
    setProgress(0);
    setErrors([]);

    const startTime = performance.now();

    try {
      // Simulate progress updates
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 100);

      // Execute calculations
      await executeCalculations();

      // Clear interval and set to 100%
      clearInterval(interval);
      setProgress(100);

      const endTime = performance.now();
      setExecutionTime(endTime - startTime);
      setLastExecuted(new Date());

      toast.success("Calculations executed successfully");

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : String(error)]);
      toast.error("Error executing calculations");
    } finally {
      setIsExecuting(false);
    }
  };

  // Reset progress after completion
  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [progress]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Calculation Status</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isExecuting || activeCalculations.length === 0}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isExecuting && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Executing calculations...</span>
                <span className="text-sm font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Calculations</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Active:</span>
                  <Badge variant="outline">{activeCalculations.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Inactive:</span>
                  <Badge variant="outline">{inactiveCalculations.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <Badge variant="outline">{calculations.length}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Performance</h4>
              <div className="space-y-1">
                {executionTime !== null && (
                  <div className="flex justify-between text-sm">
                    <span>Last execution time:</span>
                    <span>{executionTime.toFixed(2)} ms</span>
                  </div>
                )}
                {lastExecuted && (
                  <div className="flex justify-between text-sm">
                    <span>Last executed:</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{lastExecuted.toLocaleTimeString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-destructive">
                <AlertCircle className="h-4 w-4" />
                Errors
              </h4>
              <div className="bg-destructive/10 p-2 rounded text-sm space-y-1">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </div>
          )}

          {!isExecuting &&
            progress === 0 &&
            executionTime !== null &&
            errors.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                All calculations executed successfully
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
