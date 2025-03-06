import { DataTableSettings } from "@/types/ChartTypes";
import { BaseChartProps } from "@/types/ChartTypes";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableBody } from "./DataTableBody";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";

interface DataTableProps extends BaseChartProps {
  settings: DataTableSettings;
}

export function DataTable({ settings, width, height }: DataTableProps) {
  console.log("DataTable", settings);

  return (
    <div className="flex flex-col h-full w-full">
      <DataTableToolbar settings={settings} />
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <DataTableHeader settings={settings} />
          <DataTableBody settings={settings} />
        </table>
      </div>
      <DataTablePagination settings={settings} />
    </div>
  );
}
