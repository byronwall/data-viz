import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { KeyboardEvent, useState } from "react";

export interface NumericInputEnterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  stepSmall?: number;
  stepMedium?: number;
  stepLarge?: number;
  placeholder?: string;
  className?: string;
}

export function NumericInputEnter({
  value,
  onChange,
  stepSmall = 1,
  stepMedium = 10,
  stepLarge = 100,
  min,
  max,
  placeholder,
  className,
}: NumericInputEnterProps) {
  const [localValue, setLocalValue] = useState<string>(value.toString());

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    let delta = 0;

    // Handle arrow keys with modifiers
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const direction = e.key === "ArrowUp" ? 1 : -1;

      if (e.shiftKey && e.altKey) {
        delta = stepLarge * direction;
      } else if (e.shiftKey) {
        delta = stepMedium * direction;
      } else {
        delta = stepSmall * direction;
      }

      const newValue = Number(value) + delta;

      // Clamp value within min/max bounds
      const clampedValue = Math.min(
        max ?? Infinity,
        Math.max(min ?? -Infinity, newValue)
      );

      onChange(clampedValue);
      setLocalValue(clampedValue.toString());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);

    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      // Only update if within bounds
      if (
        (min === undefined || newValue >= min) &&
        (max === undefined || newValue <= max)
      ) {
        onChange(newValue);
      }
    }
  };

  const handleBlur = () => {
    // Reset to last valid value if input is empty or invalid
    if (!localValue || isNaN(parseFloat(localValue))) {
      setLocalValue(value.toString());
    }
  };

  return (
    <div className={cn("relative max-w-[160px]", className)}>
      <Input
        type="number"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        min={min}
        max={max}
        placeholder={placeholder}
        className={`w-full`}
      />
    </div>
  );
}
