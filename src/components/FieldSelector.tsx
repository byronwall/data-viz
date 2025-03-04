import { Button } from "@/components/ui/button";
import { ComboBox } from "./ComboBox";
import { Label } from "./ui/label";
import { X } from "lucide-react";

interface FieldSelectorProps {
  label: string;
  value: string;
  availableFields: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
}

export function FieldSelector({
  label,
  value,
  availableFields,
  onChange,
  placeholder = "Select field",
  allowClear = false,
}: FieldSelectorProps) {
  const fieldOptions = availableFields.map((field) => ({
    value: field,
    label: field,
  }));

  const selectedOption = fieldOptions.find((option) => option.value === value);

  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <Label htmlFor={label}>{label}</Label>
        <ComboBox
          value={selectedOption}
          options={fieldOptions}
          onChange={(option) => onChange(option?.value || value)}
          optionToString={(option) => option.label}
          placeholder={placeholder}
        />
      </div>
      {allowClear && value && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
