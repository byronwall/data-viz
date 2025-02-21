import {
  CrossfilterWrapper,
  LiveItem,
  LiveItemMap,
} from "@/hooks/CrossfilterWrapper";
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

interface DataLayerState<T extends DatumObject> extends DataLayerProps<T> {
  data: (T & HasId)[];
  setData: (data: T[]) => void;

  liveItems: LiveItemMap;

  // Chart state
  charts: ChartSettings[];
  addChart: (chart: Omit<ChartSettings, "id">) => void;
  removeChart: (chart: ChartSettings) => void;
  updateChart: (id: string, settings: Partial<ChartSettings>) => void;

  // Filter state (placeholder)
  updateFilter: (field: string, value: unknown) => void;
  clearFilters: () => void;
  clearFilter: (chart: ChartSettings) => void;

  crossfilterWrapper: CrossfilterWrapper<T & HasId>;
  nonce: number;
  getLiveItems: (chart: ChartSettings) => LiveItem;

  // data and key functions
  getColumnData: (field: string) => { [key: IdType]: datum };
  getColumnNames: () => string[];
  columnCache: Record<string, { [key: IdType]: datum }>;
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
    liveItems: {},

    // Chart management
    charts: [],
    addChart: (chartSettings) => {
      const { crossfilterWrapper } = get();
      const newChart = {
        ...chartSettings,
        id: crypto.randomUUID(),
      } as ChartSettings;

      crossfilterWrapper.addChart(newChart);
      set((state) => ({
        charts: [...state.charts, newChart],
        liveItems: crossfilterWrapper.getAllData(),
      }));
    },
    removeChart: (chart) => {
      const { crossfilterWrapper } = get();
      crossfilterWrapper.removeChart(chart);
      set((state) => ({
        charts: state.charts.filter((ogChart) => ogChart.id !== chart.id),
      }));
    },
    updateChart: (id, settings) => {
      const { crossfilterWrapper } = get();

      const chart = get().charts.find((chart) => chart.id === id);

      if (!chart) {
        console.error("updateChart: chart not found", { id });
        return;
      }

      const updatedChart: ChartSettings = {
        ...chart,
        ...settings,
      } as ChartSettings;

      crossfilterWrapper.updateChart(updatedChart);
      set((state) => ({
        charts: state.charts.map((chart) =>
          chart.id === id ? updatedChart : chart
        ),
      }));

      // ideally would determine what changed and only update the liveItems for the chart that changed
      // for now, just update all liveItems
      set({
        liveItems: crossfilterWrapper.getAllData(),
      });
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
            filterValues: { values: [] },
          });
        } else {
          updateChart(chart.id, {
            filterRange: null,
          });
        }
      }
    },
    nonce: 0,
    getLiveItems: (chart) => {
      const { liveItems } = get();

      const liveItemsForChart = liveItems[chart.id];

      return liveItemsForChart;
    },

    getColumnNames() {
      return Object.keys(get().data[0]);
    },

    getColumnData(field: string) {
      const { columnCache } = get();

      if (columnCache[field]) {
        return columnCache[field];
      }

      const data = get().data.map((row) => row[field]);
      columnCache[field] = data;

      return data;
    },

    columnCache: {},
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
