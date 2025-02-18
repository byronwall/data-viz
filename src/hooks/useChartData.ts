import { HasId, useDataLayer } from "@/providers/DataLayerProvider";
import { useMemo } from "react";

type ColumnCache = {
  [key: string]: { [key: string]: number | string };
};

export function useChartData<T extends HasId>() {
  const data = useDataLayer((state) => state.data);
  const charts = useDataLayer((state) => state.charts);
  const addChart = useDataLayer((state) => state.addChart);
  const removeChart = useDataLayer((state) => state.removeChart);

  const crossfilterWrapper = useDataLayer((state) => state.crossfilterWrapper);

  const columnCache = useMemo(() => {
    const cache: { [key: string]: { [key: string]: number | string } } = {};
    if (data.length === 0) {
      return cache;
    }

    // Get all column names from first row
    const columns = Object.keys(data[0]);

    // Build cache for each column
    columns.forEach((column) => {
      cache[column] = {};
      data.forEach((row) => {
        cache[column][row.__ID] = row[column];
      });
    });

    return cache;
  }, [data]);

  const getColumnData = (field: string) => {
    return columnCache[field] || {};
  };

  const getColumns = () => {
    return Object.keys(columnCache);
  };

  console.log("all", {
    all: crossfilterWrapper.ref.all(),
    filtered: crossfilterWrapper.ref.allFiltered(),
  });

  return {
    data,
    getColumnData,
    getColumns,
    charts,
    addChart,
    removeChart,
  };
}
