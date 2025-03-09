import { BaseChartProps } from "@/types/ChartTypes";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { MarkdownSettings } from "./definition";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { Save } from "lucide-react";

export const Markdown = ({
  settings,
  width,
  height,
}: BaseChartProps<MarkdownSettings>) => {
  const updateChart = useDataLayer((s) => s.updateChart);
  const [localContent, setLocalContent] = useState<string>(settings.content);
  const isDirty = localContent !== settings.content;

  const handleChange = (value: string) => {
    setLocalContent(value);
  };

  const handleSave = () => {
    updateChart(settings.id, {
      ...settings,
      content: localContent,
    });
  };

  return (
    <div style={{ width, height }} className="flex flex-col">
      <div className="flex-1 overflow-auto">
        <MinimalTiptapEditor
          value={localContent}
          onChange={handleChange as any}
          className="w-full h-full"
          editorContentClassName="p-5"
          output="html"
          placeholder="Enter your content..."
          autofocus={false}
          shouldHideToolbar={false}
          onSaveClick={isDirty ? handleSave : undefined}
          editorClassName="focus:outline-none"
        />
      </div>
    </div>
  );
};
