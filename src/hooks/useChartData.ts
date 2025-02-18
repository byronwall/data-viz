import { useDataLayer, HasId } from "@/providers/DataLayerProvider";
import { useEffect, useMemo, useRef } from "react";
import { CrossfilterWrapper } from "./CrossfilterWrapper";
import { ChartSettings } from "@/types/ChartTypes";

type ColumnCache = {
  [key: string]: { [key: string]: number | string };
};

export function useChartData<T extends HasId>() {
  const data = useDataLayer((state) => state.data);
  const charts = useDataLayer((state) => state.charts);
  const addChart = useDataLayer((state) => state.addChart);
  const removeChart = useDataLayer((state) => state.removeChart);
  const updateChart = useDataLayer((state) => state.updateChart);

  const crossfilterWrapper = useRef<CrossfilterWrapper<T>>(null);

  useEffect(() => {
    crossfilterWrapper.current = new CrossfilterWrapper<T>(
      data as (T & HasId)[],
      (d) => d.__ID
    );
  }, [data]);

  useEffect(() => {
    // if the charts change, we need to update the crossfilterWrapper
    console.log("[useChartData] Charts changed:", charts);
    crossfilterWrapper.current?.updateCharts(charts);
  }, [charts]);

  const getLiveIdsForDimension = (chart: ChartSettings) => {
    const dimension = crossfilterWrapper.current?.charts.get(
      chart.id
    )?.dimension;
    if (!dimension) {
      return [];
    }
    const _all = dimension.group().all();

    const all = _all.filter((c) => c.value > 0).map((d) => d.key);

    console.log("getLiveIdsForDimension", {
      name: chart.title,
      filters: chart.rowFilters,
      all,
      _all,
    });

    // retrn a Set
    return all;
  };

  const getFilterFunction = (chart: ChartSettings) => {
    return crossfilterWrapper.current?.getFilterFunction(chart);
  };

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
    all: crossfilterWrapper.current?.ref.all(),
    filtered: crossfilterWrapper.current?.ref.allFiltered(),
  });

  return {
    data,
    getColumnData,
    getColumns,
    charts,
    addChart,
    removeChart,
    updateChart,
    getLiveIdsForDimension,
    getFilterFunction,
  };
}
