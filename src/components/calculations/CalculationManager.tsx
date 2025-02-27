import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { PlusCircle, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CalculationPreview } from "./CalculationPreview";
import { ExpressionBuilder } from "./ExpressionBuilder";

export type CalcBuilder = {
  name: string;
  resultColumnName: string;
  expressionString: string;
};

export function CalculationManager() {
  const calculations = useDataLayer((state) => state.calculations);
  const addCalculation = useDataLayer((state) => state.addCalculation);
  const removeCalculation = useDataLayer((state) => state.removeCalculation);
  const updateCalculation = useDataLayer((state) => state.updateCalculation);
  const executeCalculations = useDataLayer(
    (state) => state.executeCalculations
  );
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const data = useDataLayer((state) => state.data);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [currentCalculation, setCurrentCalculation] = useState<string | null>(
    null
  );

  const [newCalcName, setNewCalcName] = useState("");
  const [newCalcColumn, setNewCalcColumn] = useState("");
  const [newExpression, setNewExpression] = useState("");

  const availableFields = getColumnNames();
  const availableFunctions: string[] = []; // This would come from a function registry

  const handleAddCalculation = async () => {
    if (!newCalcName.trim()) {
      toast.error("Please enter a calculation name");
      return;
    }

    if (!newCalcColumn.trim()) {
      toast.error("Please enter a result column name");
      return;
    }

    if (!newExpression.trim()) {
      toast.error("Please enter an expression");
      return;
    }

    try {
      console.log("add new ", newExpression, parseExpression(newExpression));

      await addCalculation({
        name: newCalcName,
        resultColumnName: newCalcColumn,
        expression: parseExpression(newExpression),
        isActive: true,
      });

      toast.success("Calculation added successfully");
      setIsAddDialogOpen(false);
      resetNewCalculationForm();
    } catch (error) {
      toast.error(
        `Failed to add calculation: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleToggleActive = async (
    resultColumnName: string,
    isActive: boolean
  ) => {
    try {
      updateCalculation(resultColumnName, { isActive });
      await executeCalculations();
      toast.success(`Calculation ${isActive ? "activated" : "deactivated"}`);
    } catch (error) {
      toast.error(
        `Failed to update calculation: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleRemoveCalculation = (resultColumnName: string) => {
    removeCalculation(resultColumnName);
    toast.success("Calculation removed");
  };

  const handleEditCalculation = (resultColumnName: string) => {
    const calculation = calculations.find(
      (calc) => calc.resultColumnName === resultColumnName
    );
    if (calculation) {
      setCurrentCalculation(resultColumnName);
      setNewCalcName(calculation.name);
      setNewCalcColumn(calculation.resultColumnName);
      setNewExpression(calculation.expression.rawInput);
      setIsEditDialogOpen(true);
    }
  };

  const handlePreviewCalculation = (resultColumnName: string) => {
    const calculation = calculations.find(
      (calc) => calc.resultColumnName === resultColumnName
    );
    if (calculation) {
      setCurrentCalculation(resultColumnName);
      setIsPreviewDialogOpen(true);
    }
  };

  const handleUpdateCalculation = async () => {
    if (!currentCalculation) {
      return;
    }

    if (!newCalcName.trim()) {
      toast.error("Please enter a calculation name");
      return;
    }

    if (!newCalcColumn.trim()) {
      toast.error("Please enter a result column name");
      return;
    }

    if (!newExpression.trim()) {
      toast.error("Please enter an expression");
      return;
    }

    try {
      updateCalculation(currentCalculation, {
        name: newCalcName,
        resultColumnName: newCalcColumn,
        expression: parseExpression(newExpression),
      });

      await executeCalculations();
      toast.success("Calculation updated successfully");
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error(
        `Failed to update calculation: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const resetNewCalculationForm = () => {
    setNewCalcName("");
    setNewCalcColumn("");
    setNewExpression("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Calculations</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                resetNewCalculationForm();
                setIsAddDialogOpen(true);
              }}
            >
              <PlusCircle className="h-4 w-4" />
              Add Calculation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Calculation</DialogTitle>
              <DialogDescription>
                Create a new calculation to transform your data
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calc-name">Calculation Name</Label>
                  <Input
                    id="calc-name"
                    value={newCalcName}
                    onChange={(e) => setNewCalcName(e.target.value)}
                    placeholder="My Calculation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="result-column">Result Column Name</Label>
                  <Input
                    id="result-column"
                    value={newCalcColumn}
                    onChange={(e) => setNewCalcColumn(e.target.value)}
                    placeholder="calculated_field"
                  />
                </div>
              </div>

              <ExpressionBuilder
                expression={newExpression}
                onChange={setNewExpression}
                availableFields={availableFields}
                availableFunctions={availableFunctions}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddCalculation}>Add Calculation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {calculations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No calculations defined. Add one to get started.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Result Column</TableHead>
                <TableHead>Expression</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculations.map((calc) => (
                <TableRow key={calc.resultColumnName}>
                  <TableCell>{calc.name}</TableCell>
                  <TableCell>{calc.resultColumnName}</TableCell>
                  <TableCell className="font-mono text-sm max-w-[300px] truncate">
                    {calc.expression.rawInput}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={calc.isActive}
                      onCheckedChange={(checked) =>
                        handleToggleActive(calc.resultColumnName, checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handlePreviewCalculation(calc.resultColumnName)
                        }
                      >
                        Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleEditCalculation(calc.resultColumnName)
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveCalculation(calc.resultColumnName)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Calculation</DialogTitle>
            <DialogDescription>Update your calculation</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-calc-name">Calculation Name</Label>
                <Input
                  id="edit-calc-name"
                  value={newCalcName}
                  onChange={(e) => setNewCalcName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-result-column">Result Column Name</Label>
                <Input
                  id="edit-result-column"
                  value={newCalcColumn}
                  onChange={(e) => setNewCalcColumn(e.target.value)}
                />
              </div>
            </div>

            <ExpressionBuilder
              expression={newExpression}
              onChange={setNewExpression}
              availableFields={availableFields}
              availableFunctions={availableFunctions}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCalculation}>
              Update Calculation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Calculation Preview</DialogTitle>
            <DialogDescription>Preview calculation results</DialogDescription>
          </DialogHeader>
          {currentCalculation && (
            <div className="py-4">
              {calculations.find(
                (calc) => calc.resultColumnName === currentCalculation
              )?.expression && (
                <CalculationPreview
                  expression={
                    calculations.find(
                      (calc) => calc.resultColumnName === currentCalculation
                    )!.expression
                  }
                  data={data}
                  previewRows={10}
                />
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsPreviewDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
