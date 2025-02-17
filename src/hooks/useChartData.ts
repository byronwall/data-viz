import { useDataLayer, HasId } from "@/providers/DataLayerProvider";
import { useEffect, useMemo, useRef, useState } from "react";
import { CrossfilterWrapper } from "./CrossfilterWrapper";
import { ChartSettings } from "@/types/ChartTypes";

type ColumnCache = {
  [key: string]: number[] | string[];
};

export function useChartData<T extends HasId>() {
  const data = useDataLayer((state) => state.data);

  const crossfilterWrapper = useRef<CrossfilterWrapper<T>>(null);

  const [charts, setCharts] = useState<ChartSettings[]>([]);

  useEffect(() => {
    crossfilterWrapper.current = new CrossfilterWrapper<T>(
      data as (T & HasId)[],
      (d) => d.__ID
    );
  }, [data]);

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

  console.log("all", crossfilterWrapper.current?.ref.all());

  return {
    data,
    getColumnData,
    getColumns,
    charts,
    setCharts,
  };
}
