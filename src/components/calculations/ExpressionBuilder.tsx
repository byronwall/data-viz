import React, { useState } from "react";
import { type Expression } from "@/lib/calculations/types";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { FunctionBrowser } from "./FunctionBrowser";

interface ExpressionBuilderProps {
  expression: Expression;
  onChange: (expression: Expression) => void;
  availableFields: string[];
  availableFunctions: string[];
}

export function ExpressionBuilder({
  expression,
  onChange,
  availableFields,
  availableFunctions,
}: ExpressionBuilderProps) {
  const [expressionText, setExpressionText] = useState(expression.expression);
  const [error, setError] = useState<string | null>(null);

  const handleExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpressionText(e.target.value);
    setError(null);
  };

  const handleValidate = () => {
    try {
      parseExpression(expressionText);
      setError(null);
      toast.success("Expression is valid!");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast.error("Invalid expression");
    }
  };

  const handleSave = () => {
    try {
      const parsed = parseExpression(expressionText);
      onChange({
        ...expression,
        expression: expressionText,
        dependencies: parsed.dependencies,
      });
      toast.success("Expression saved!");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast.error("Failed to save expression");
    }
  };

  const handleInsertField = (field: string) => {
    setExpressionText((prev) => prev + field);
  };

  const handleInsertFunction = (func: string) => {
    setExpressionText((prev) => prev + `${func}()`);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="expression">Expression</Label>
        <div className="flex gap-2">
          <Input
            id="expression"
            value={expressionText}
            onChange={handleExpressionChange}
            placeholder="Enter your expression..."
            className="flex-1"
          />
          <Button onClick={handleValidate} variant="secondary">
            Validate
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Available Fields</h3>
          <div className="flex flex-wrap gap-2">
            {availableFields.map((field) => (
              <Button
                key={field}
                variant="outline"
                size="sm"
                onClick={() => handleInsertField(field)}
              >
                {field}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Functions</h3>
          <FunctionBrowser onSelect={handleInsertFunction} />
        </Card>
      </div>
    </div>
  );
}
