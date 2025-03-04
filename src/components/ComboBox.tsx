"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CommandList } from "cmdk";

interface ComboBoxProps<T> {
  value: T | undefined;
  options: T[];
  onChange: (value: T | undefined) => void;
  optionToString?: (option: T) => string;
  optionToNode?: (option: T) => React.ReactNode;
  placeholder?: string;
  className?: string;
}

export function ComboBox<T>({
  value,
  options,
  onChange,
  optionToString = (option) => String(option),
  optionToNode,
  placeholder = "Select option...",
  className,
}: ComboBoxProps<T>) {
  const [open, setOpen] = useState(false);

  const renderOption = (option: T) => {
    if (optionToNode) {
      return optionToNode(option);
    }
    return optionToString(option);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value ? renderOption(value) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandGroup>
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              {options.map((option, index) => {
                return (
                  <CommandItem
                    key={index}
                    onSelect={() => {
                      onChange(option === value ? undefined : option);
                      setOpen(false);
                    }}
                    value={optionToString(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {renderOption(option)}
                  </CommandItem>
                );
              })}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
