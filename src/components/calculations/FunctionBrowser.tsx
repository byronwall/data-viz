import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getCategories,
  getFunctionsByCategory,
  getFunctionDocs,
} from "@/lib/calculations/functions/registry";

interface FunctionBrowserProps {
  onSelect: (functionName: string) => void;
}

export function FunctionBrowser({ onSelect }: FunctionBrowserProps) {
  const [search, setSearch] = useState("");
  const categories = getCategories();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.toLowerCase());
  };

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search functions..."
        value={search}
        onChange={handleSearch}
      />

      <ScrollArea className="h-[300px]">
        <Accordion type="single" collapsible>
          {categories.map((category) => {
            const functions = getFunctionsByCategory(category).filter(
              (func) =>
                !search ||
                func.name.toLowerCase().includes(search) ||
                func.description.toLowerCase().includes(search)
            );

            if (functions.length === 0) {
              return null;
            }

            return (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="capitalize">
                  {category}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2">
                    {functions.map((func) => {
                      const docs = getFunctionDocs(func.name);
                      return (
                        <TooltipProvider key={func.name}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start font-mono"
                                onClick={() => onSelect(func.name)}
                              >
                                {func.name}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-sm">
                              <div className="space-y-2">
                                <p>{func.description}</p>
                                {docs && (
                                  <>
                                    <p className="font-mono text-sm">
                                      {docs.syntax}
                                    </p>
                                    {docs.examples.length > 0 && (
                                      <div>
                                        <p className="text-sm font-semibold">
                                          Example:
                                        </p>
                                        <p className="font-mono text-sm">
                                          {docs.examples[0]}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>
    </div>
  );
}
