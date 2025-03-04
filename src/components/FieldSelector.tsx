import { ComboBox } from "./ComboBox";
import { Label } from "./ui/label";

interface FieldSelectorProps {
  label: string;
  value: string;
  availableFields: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FieldSelector({
  label,
  value,
  availableFields,
  onChange,
  placeholder = "Select field",
}: FieldSelectorProps) {
  const fieldOptions = availableFields.map((field) => ({
    value: field,
    label: field,
  }));

  const selectedOption = fieldOptions.find((option) => option.value === value);

  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <ComboBox
        value={selectedOption}
        options={fieldOptions}
        onChange={(option) => onChange(option?.value || value)}
        optionToString={(option) => option.label}
        placeholder={placeholder}
      />
    </div>
  );
}
