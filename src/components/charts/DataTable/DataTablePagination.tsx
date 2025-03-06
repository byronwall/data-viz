import { DataTableSettings } from "@/types/ChartTypes";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDataLayer } from "@/providers/DataLayerProvider";

interface DataTablePaginationProps {
  settings: DataTableSettings;
}

const PAGE_SIZE_OPTIONS = [
  { label: "10 rows", value: 10 },
  { label: "25 rows", value: 25 },
  { label: "50 rows", value: 50 },
  { label: "100 rows", value: 100 },
];

export function DataTablePagination({ settings }: DataTablePaginationProps) {
  console.log("DataTablePagination", settings);
  const { pageSize, currentPage } = settings;
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));
  const updateChart = useDataLayer((state) => state.updateChart);

  // Get filtered data from liveItems
  const filteredData =
    liveItems?.items
      .filter((item) => item.value > 0)
      .map((item) => data.find((row) => row.__ID === item.key))
      .filter(
        (row): row is { __ID: number; [key: string]: any } => row !== undefined
      ) || [];

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value, 10);
    const newCurrentPage = Math.min(
      Math.ceil((currentPage * pageSize) / newPageSize),
      Math.ceil(filteredData.length / newPageSize)
    );
    updateChart(settings.id, {
      pageSize: newPageSize,
      currentPage: newCurrentPage,
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateChart(settings.id, { currentPage: newPage });
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-gray-700">{filteredData.length} rows</p>
      </div>
      <div className="flex items-center space-x-2">
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="h-8 w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
