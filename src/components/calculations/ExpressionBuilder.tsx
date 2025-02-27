import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { Dispatch, SetStateAction, useState } from "react";
import { FunctionBrowser } from "./FunctionBrowser";

interface ExpressionBuilderProps {
  expression: string;
  // dispatch function
  onChange: Dispatch<SetStateAction<string>>;
  availableFields: string[];
  availableFunctions: string[];
}

export function ExpressionBuilder({
  expression,
  onChange,
  availableFields,
  availableFunctions,
}: ExpressionBuilderProps) {
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error" | null;
  }>({
    text: "",
    type: null,
  });

  const handleValidate = () => {
    try {
      parseExpression(expression);
      setError(null);
      setStatusMessage({ text: "Expression is valid!", type: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatusMessage({ text: "Invalid expression", type: "error" });
    }
  };

  const handleInsertField = (field: string) => {
    onChange((prev) => prev + field);
  };

  const handleInsertFunction = (func: string) => {
    onChange((prev) => prev + `${func}()`);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="expression">Expression</Label>
        <div className="flex gap-2">
          <Input
            id="expression"
            value={expression}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your expression..."
            className="flex-1"
          />
          <Button onClick={handleValidate} variant="secondary">
            Validate
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {statusMessage.text && (
          <p
            className={`text-sm ${
              statusMessage.type === "success"
                ? "text-green-500"
                : statusMessage.type === "error"
                ? "text-red-500"
                : ""
            }`}
          >
            {statusMessage.text}
          </p>
        )}
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
