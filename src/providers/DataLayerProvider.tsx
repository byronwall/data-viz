import { CrossfilterWrapper } from "@/hooks/CrossfilterWrapper";
import { ChartSettings } from "@/types/ChartTypes";
import { createContext, useContext, useRef } from "react";
import { createStore, useStore } from "zustand";

// Props and State interfaces
interface DataLayerProps<T> {
  data?: T[];
}

// Add ID to the data type
export type HasId = { __ID: number };

interface DataLayerState<T> extends DataLayerProps<T> {
  data: (T & HasId)[];
  setData: (data: T[]) => void;

  // Chart state
  charts: ChartSettings[];
  addChart: (chart: Omit<ChartSettings, "id">) => void;
  removeChart: (id: string) => void;
  updateChart: (id: string, settings: ChartSettings) => void;

  // Filter state (placeholder)
  updateFilter: (field: string, value: unknown) => void;
  clearFilters: () => void;
  clearFilter: (chart: ChartSettings) => void;

  crossfilterWrapper: CrossfilterWrapper<T & HasId>;
  nonce: number;
  getLiveIdsForDimension: (dimension: ChartSettings) => number[];
}

// Store type
type DataLayerStore<T> = ReturnType<typeof createDataLayerStore<T>>;

function getDataAndCrossfilterWrapper<T>(data: T[]) {
  const dataWithIds = data.map((row, index) => ({
    ...row,
    __ID: index,
  }));
  return {
    data: dataWithIds,
    crossfilterWrapper: new CrossfilterWrapper<T & HasId>(
      dataWithIds,
      (d) => d.__ID
    ),
  };
}

// Store creator
const createDataLayerStore = <T,>(initProps?: Partial<DataLayerProps<T>>) => {
  const { data: initData, crossfilterWrapper } = getDataAndCrossfilterWrapper(
    initProps?.data ?? []
  );

  return createStore<DataLayerState<T>>()((set, get) => ({
    data: initData,
    crossfilterWrapper,
    setData: (rawData) => {
      set({
        ...getDataAndCrossfilterWrapper(rawData),
      });
    },

    // Chart management
    charts: [],
    addChart: (chartSettings) => {
      const { crossfilterWrapper } = get();
      const newChart = {
        ...chartSettings,
        id: crypto.randomUUID(),
      };
      crossfilterWrapper.addChart(newChart);
      set((state) => ({ charts: [...state.charts, newChart] }));
    },
    removeChart: (id) => {
      const { crossfilterWrapper } = get();
      crossfilterWrapper.removeChart(id);
      set((state) => ({
        charts: state.charts.filter((chart) => chart.id !== id),
      }));
    },
    updateChart: (id, settings) => {
      const { crossfilterWrapper } = get();
      crossfilterWrapper.updateChart(settings);
      set((state) => ({
        charts: state.charts.map((chart) =>
          chart.id === id ? settings : chart
        ),
      }));
    },

    updateFilter: (field, value) => {
      set((state) => ({
        // do nothing
      }));
    },
    clearFilters: () => {},
    clearFilter: (chart) => {
      const { updateChart } = get();

      const chartDim = crossfilterWrapper.charts.get(chart.id);
      if (chartDim) {
        chartDim.dimension.filterAll();
        // Update the chart to reflect the cleared state
        if (chart.type === "row") {
          updateChart(chart.id, {
            ...chart,
            rowFilters: { values: [] },
          });
        } else {
          updateChart(chart.id, chart);
        }
      }
    },
    nonce: 0,
    getLiveIdsForDimension: (chart) => {
      const { crossfilterWrapper } = get();

      const dim = crossfilterWrapper.charts.get(chart.id)?.dimension;
      if (!dim) {
        console.error("getLiveIdsForDimension: dimension not found", {
          chart,
        });
        return [];
      }

      const _all = dim.group().all();

      return _all;
    },
  }));
};

// Create context
export const DataLayerContext = createContext<DataLayerStore<any> | null>(null);

// Provider wrapper
type DataLayerProviderProps<T> = React.PropsWithChildren<DataLayerProps<T>>;

export function DataLayerProvider<T>({
  children,
  ...props
}: DataLayerProviderProps<T>) {
  const storeRef = useRef<DataLayerStore<T> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createDataLayerStore<T>(props);
  }
  return (
    <DataLayerContext.Provider value={storeRef.current}>
      {children}
    </DataLayerContext.Provider>
  );
}

// Custom hook that mimics the hook returned by `create`
export function useDataLayer<T, U>(
  selector: (state: DataLayerState<T>) => U
): U {
  const store = useContext(DataLayerContext);
  if (!store) {
    throw new Error("Missing DataLayerContext.Provider in the tree");
  }
  return useStore(store, selector);
}
