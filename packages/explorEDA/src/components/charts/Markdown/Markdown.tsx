import { BaseChartProps } from "@/types/ChartTypes";
import { MarkdownSettings } from "./definition";

import { useDataLayer } from "@/providers/DataLayerProvider";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea.js";

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
        <Textarea value={localContent} onChange={handleChange as any} />
      </div>
    </div>
  );
};
