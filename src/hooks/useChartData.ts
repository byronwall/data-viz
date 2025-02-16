import { useMemo } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";

type ColumnCache = {
  [key: string]: number[] | string[];
};

export function useChartData() {
  const data = useDataLayer((state) => state.data);

  const columnCache = useMemo(() => {
    const cache: ColumnCache = {};
    if (data.length === 0) return cache;

    // Get all column names from first row
    const columns = Object.keys(data[0]);

    // Build cache for each column
    columns.forEach((column) => {
      cache[column] = data.map((row) => row[column]);
    });

    return cache;
  }, [data]);

  const getColumnData = (field: string) => {
    return columnCache[field] || [];
  };

  const getColumns = () => {
    return Object.keys(columnCache);
  };

  return {
    data,
    getColumnData,
    getColumns,
  };
}
