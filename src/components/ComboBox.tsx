"use client";

import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ComboBoxProps<T> {
  options: T[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  optionToLabel?: (option: T) => string;
  onCreateNew?: (searchValue: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  children?: React.ReactNode;
  allowClear?: boolean;
  renderOption?: (option: T) => React.ReactNode;
}

export function ComboBox<T>({
  options,
  value,
  onChange,
  optionToLabel = String,
  onCreateNew,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  children,
  allowClear = false,
  renderOption,
}: ComboBoxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    return options.filter((option) =>
      optionToLabel(option).toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search, optionToLabel]);

  const showCreateNew = onCreateNew;

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {children ?? (
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {value
                ? renderOption
                  ? renderOption(value)
                  : optionToLabel(value)
                : placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {showCreateNew && (
                  <CommandItem
                    value={`Create "${search}"`}
                    onSelect={() => {
                      onCreateNew?.(search);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create {search.length > 0 ? `"${search}"` : " new..."}
                  </CommandItem>
                )}
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={optionToLabel(option)}
                    value={optionToLabel(option)}
                    onSelect={() => {
                      onChange(option === value ? undefined : option);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {renderOption
                      ? renderOption(option)
                      : optionToLabel(option)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {allowClear && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-gray-500"
          onClick={() => onChange(undefined)}
          disabled={!value}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
