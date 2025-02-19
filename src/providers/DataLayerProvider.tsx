import { CrossfilterWrapper } from "@/hooks/CrossfilterWrapper";
import { ChartSettings, datum } from "@/types/ChartTypes";
import { createContext, useContext, useRef } from "react";
import { createStore, useStore } from "zustand";

type DatumObject = { [key: string]: datum };

// Props and State interfaces
interface DataLayerProps<T extends DatumObject> {
  data?: T[];
}

// Add ID to the data type
type IdType = number;
export type HasId = { __ID: IdType };

type LiveItem = { key: datum; value: number };

interface DataLayerState<T extends DatumObject> extends DataLayerProps<T> {
  data: (T & HasId)[];
  setData: (data: T[]) => void;

  // Chart state
  charts: ChartSettings[];
  addChart: (chart: Omit<ChartSettings, "id">) => void;
  removeChart: (chart: ChartSettings) => void;
  updateChart: (chart: ChartSettings) => void;

  // Filter state (placeholder)
  updateFilter: (field: string, value: unknown) => void;
  clearFilters: () => void;
  clearFilter: (chart: ChartSettings) => void;

  crossfilterWrapper: CrossfilterWrapper<T & HasId>;
  nonce: number;
  getLiveItems: (chart: ChartSettings) => LiveItem[];

  // data and key functions
  getColumnData: (field: string) => { [key: IdType]: datum };
  getColumnNames: () => string[];
}

// Store type
type DataLayerStore<T extends DatumObject> = ReturnType<
  typeof createDataLayerStore<T>
>;

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
const createDataLayerStore = <T extends DatumObject>(
  initProps?: Partial<DataLayerProps<T>>
) => {
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
    removeChart: (chart) => {
      const { crossfilterWrapper } = get();
      crossfilterWrapper.removeChart(chart);
      set((state) => ({
        charts: state.charts.filter((ogChart) => ogChart.id !== chart.id),
      }));
    },
    updateChart: (settings) => {
      const { crossfilterWrapper } = get();
      crossfilterWrapper.updateChart(settings);
      set((state) => ({
        charts: state.charts.map((chart) =>
          chart.id === settings.id ? settings : chart
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
          updateChart({
            ...chart,
            rowFilters: { values: [] },
          });
        } else {
          updateChart(chart);
        }
      }
    },
    nonce: 0,
    getLiveItems: (chart) => {
      const { crossfilterWrapper } = get();

      const dim = crossfilterWrapper.charts.get(chart.id)?.dimension;
      if (!dim) {
        console.error("getLiveIdsForDimension: dimension not found", {
          chart,
        });
        return [];
      }

      const _all = dim.group().all() as LiveItem[];

      return _all;
    },

    getColumnNames() {
      return Object.keys(get().data[0]);
    },

    getColumnData(field: string) {
      return get().data.map((row) => row[field]);
    },
  }));
};

// Create context
export const DataLayerContext = createContext<DataLayerStore<any> | null>(null);

// Provider wrapper
type DataLayerProviderProps<T> = React.PropsWithChildren<DataLayerProps<T>>;

export function DataLayerProvider<T extends DatumObject>({
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
export function useDataLayer<T extends DatumObject, U>(
  selector: (state: DataLayerState<T>) => U
): U {
  const store = useContext(DataLayerContext);
  if (!store) {
    throw new Error("Missing DataLayerContext.Provider in the tree");
  }
  return useStore(store, selector);
}
