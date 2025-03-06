import { DataTableSettings } from "@/types/ChartTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";
import { useDataLayer } from "@/providers/DataLayerProvider";

interface DataTableToolbarProps {
  settings: DataTableSettings;
}

export function DataTableToolbar({ settings }: DataTableToolbarProps) {
  const updateChart = useDataLayer((state) => state.updateChart);

  const handleSearch = (value: string) => {
    updateChart(settings.id, {
      ...settings,
      globalSearch: value,
      currentPage: 1, // Reset to first page when searching
    });
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8"
            value={settings.globalSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            // TODO: Implement export
          }}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
