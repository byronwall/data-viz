import {
  CrossfilterWrapper,
  LiveItem,
  LiveItemMap,
} from "@/hooks/CrossfilterWrapper";
import { getEmptyFilterObj } from "@/hooks/getFilterValues";
import {
  CalculationDefinition,
  CalculationManager,
} from "@/lib/calculations/CalculationState";
import { ChartSettings, datum } from "@/types/ChartTypes";
import { ColorScaleType } from "@/types/ColorScaleTypes";
import { saveProject } from "@/utils/localStorage";
import { createContext, useContext, useRef } from "react";
import { createStore, useStore } from "zustand";

type DatumObject = { [key: string]: datum };
export type { DatumObject };

// Props and State interfaces
interface DataLayerProps<T extends DatumObject> {
  data?: T[];
}

// Add ID to the data type
type IdType = number;
export type HasId = { __ID: IdType };

interface DataLayerState<T extends DatumObject> extends DataLayerProps<T> {
  data: (T & HasId)[];
  fileName: string | undefined;
  setData: (data: T[], fileName?: string) => void;

  liveItems: LiveItemMap;

  // Chart state
  charts: ChartSettings[];
  addChart: (chart: Omit<ChartSettings, "id">) => void;
  removeChart: (chart: ChartSettings) => void;
  removeAllCharts: () => void;
  updateChart: (id: string, settings: Partial<ChartSettings>) => void;

  // Color scale state
  colorScales: ColorScaleType[];
  addColorScale: (scale: Omit<ColorScaleType, "id">) => ColorScaleType;
  removeColorScale: (id: string) => void;
  updateColorScale: (id: string, updates: Partial<ColorScaleType>) => void;

  // Filter state (placeholder)
  clearAllFilters: () => void;
  clearFilter: (chart: ChartSettings) => void;

  crossfilterWrapper: CrossfilterWrapper<T & HasId>;
  nonce: number;
  getLiveItems: (chart: ChartSettings) => LiveItem;

  // data and key functions
  getColumnData: (field: string | undefined) => { [key: IdType]: datum };
  getColumnNames: () => string[];
  columnCache: Record<string, { [key: IdType]: datum }>;

  // Project and View Management
  currentProject: SavedProject | null;
  setCurrentProject: (project: SavedProject) => void;
  saveCurrentView: (name: string) => void;
  loadView: (view: SavedView) => void;

  // Calculation state
  calculationManager: CalculationManager<T> | null;
  calculations: CalculationDefinition[];
  addCalculation: (
    calculation: Omit<CalculationDefinition, "id">
  ) => Promise<CalculationDefinition>;
  removeCalculation: (id: string) => void;
  updateCalculation: (
    id: string,
    updates: Partial<CalculationDefinition>
  ) => void;
  executeCalculations: () => Promise<void>;
  getVirtualColumns: () => Record<string, Record<number, any>>;
  getCalculationResultForRow: (calculationId: string, rowId: number) => any;
}

// Store type
type DataLayerStore<T extends DatumObject> = ReturnType<
  typeof createDataLayerStore<T>
>;

function getDataAndCrossfilterWrapper<T extends DatumObject>(
  data: T[]
): Partial<DataLayerState<T>> {
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
    charts: [],
    colorScales: [],
    calculationManager: new CalculationManager<T>(dataWithIds),
    calculations: [],
  };
}

// Store creator
const createDataLayerStore = <T extends DatumObject>(
  initProps?: Partial<DataLayerProps<T>>
) => {
  const {
    data: initData,
    crossfilterWrapper,
    calculationManager,
  } = getDataAndCrossfilterWrapper(initProps?.data ?? []);

  if (!crossfilterWrapper || !initData || !calculationManager) {
    throw new Error(
      "Data, crossfilterWrapper, or calculationManager not found"
    );
  }

  return createStore<DataLayerState<T>>()((set, get) => ({
    data: initData,
    fileName: undefined,
    crossfilterWrapper,
    calculationManager,
    calculations: [],
    setData: (rawData, fileName) => {
      // Get fresh crossfilter and data with IDs
      const {
        data: newData,
        crossfilterWrapper: newCrossfilter,
        calculationManager: newCalculationManager,
      } = getDataAndCrossfilterWrapper(rawData);

      // Reset everything to initial state
      set({
        data: newData,
        fileName,
        crossfilterWrapper: newCrossfilter,
        calculationManager: newCalculationManager,
        calculations: [],
        charts: [],
        colorScales: [],
        liveItems: {},
        columnCache: {},
        nonce: 0,
        currentProject: null,
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
    removeAllCharts: () => {
      const { crossfilterWrapper } = get();
      crossfilterWrapper.removeAllCharts();
      set({ charts: [] });
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
        liveItems: crossfilterWrapper.getAllData(),
      }));
    },

    // Color scale management
    colorScales: [] as ColorScaleType[],
    addColorScale: (scale: Omit<ColorScaleType, "id">) => {
      const newScale = {
        ...scale,
        id: crypto.randomUUID(),
      } as ColorScaleType;

      set((state) => ({
        colorScales: [...state.colorScales, newScale],
      }));

      return newScale;
    },
    removeColorScale: (id: string) => {
      set((state) => ({
        colorScales: state.colorScales.filter((scale) => scale.id !== id),
      }));
    },
    updateColorScale: (id: string, updates: Partial<ColorScaleType>) => {
      set((state) => ({
        colorScales: state.colorScales.map((scale) =>
          scale.id === id ? ({ ...scale, ...updates } as ColorScaleType) : scale
        ),
      }));
    },

    clearAllFilters: () => {
      const { charts, crossfilterWrapper } = get();

      const newCharts = charts.map((chart) => {
        const emptyFilter = getEmptyFilterObj(chart);

        return {
          ...chart,
          ...emptyFilter,
        };
      }) as ChartSettings[];

      for (const chart of newCharts) {
        crossfilterWrapper.updateChart(chart);
      }

      // Update all live items in a single update
      set({
        charts: newCharts,
        liveItems: crossfilterWrapper.getAllData(),
      });
    },
    clearFilter: (chart) => {
      const { updateChart } = get();

      const emptyFilter = getEmptyFilterObj(chart);
      if (emptyFilter) {
        updateChart(chart.id, emptyFilter);
      }
    },
    nonce: 0,
    getLiveItems: (chart) => {
      const { liveItems } = get();

      const liveItemsForChart = liveItems[chart.id];

      return liveItemsForChart;
    },

    getColumnNames() {
      const { data, getVirtualColumns } = get();
      const baseColumns = Object.keys(data[0] || {});
      const virtualColumns = Object.keys(getVirtualColumns());

      return [...baseColumns, ...virtualColumns];
    },

    getColumnData(field: string | undefined) {
      const { columnCache, data, getVirtualColumns } = get();

      if (!field) {
        return {};
      }

      console.log("DataLayerProvider getColumnData", {
        field,
        columnCache,
      });

      if (columnCache[field]) {
        return columnCache[field];
      }

      // Check if it's a virtual column
      const virtualColumns = getVirtualColumns();
      console.log("DataLayerProvider getColumnData", {
        field,
        virtualColumns,
      });
      if (field in virtualColumns) {
        columnCache[field] = virtualColumns[field];
        return virtualColumns[field];
      }

      // Otherwise, it's a regular column
      const columnData: { [key: IdType]: datum } = {};
      data.forEach((row) => {
        columnData[row.__ID] = row[field];
      });

      columnCache[field] = columnData;
      return columnData;
    },

    columnCache: {},

    // Project and View Management
    currentProject: null,
    setCurrentProject: (project: SavedProject) => {
      set({ currentProject: project });
      // Only save to storage if the project is marked as saved
      if (project.isSaved) {
        saveProject(project);
      }
    },
    saveCurrentView: (name: string) => {
      const { charts, currentProject, calculations } = get();

      if (!currentProject) {
        console.error("No project selected");
        return;
      }

      const newView: SavedView = {
        version: 1,
        name,
        charts: [...charts],
        calculations: [...calculations],
      };

      const updatedProject: SavedProject = {
        ...currentProject,
        views: [...currentProject.views, newView],
      };

      set({ currentProject: updatedProject });
      // Only save to storage if the project is marked as saved
      if (updatedProject.isSaved) {
        saveProject(updatedProject);
      }
    },
    loadView: (view: SavedView) => {
      const { crossfilterWrapper, calculationManager } = get();

      // Clear existing charts
      crossfilterWrapper.charts.forEach((_, chartId) => {
        crossfilterWrapper.removeChart({ id: chartId } as ChartSettings);
      });

      // Load new charts
      set({ charts: view.charts });

      // Initialize crossfilter for new charts
      view.charts.forEach((chart) => {
        crossfilterWrapper.addChart(chart);
      });

      // Load calculations if they exist
      if (view.calculations) {
        // Clear existing calculations
        calculationManager?.getCalculations().forEach((calc) => {
          calculationManager.removeCalculation(calc.resultColumnName);
        });

        // Add new calculations
        const newCalculations: CalculationDefinition[] = [];
        view.calculations.forEach(async (calc) => {
          if (calculationManager) {
            const calcWithId: CalculationDefinition = {
              name: calc.name,
              expression: calc.expression,
              isActive: calc.isActive,
              resultColumnName: calc.resultColumnName,
              id: calc.id || crypto.randomUUID(),
            };

            try {
              const result = await calculationManager.addAndExecCalculation(
                calcWithId
              );
              newCalculations.push(result.calculation);
            } catch (error) {
              console.error("Error adding calculation:", error);
            }
          }
        });

        set({ calculations: newCalculations });
      }

      set({ liveItems: crossfilterWrapper.getAllData() });
    },

    // Calculation management
    addCalculation: async (calculation) => {
      const { calculationManager } = get();
      console.log("*** DataLayerProvider addCalculation", {
        calculation,
        expression: calculation.expression,
        depends: calculation.expression.dependencies,
      });
      if (!calculationManager) {
        throw new Error("Calculation manager not initialized");
      }

      // Add an id to the calculation
      const calculationWithId: CalculationDefinition = {
        ...calculation,
        id: crypto.randomUUID(),
      };

      const result = await calculationManager.addAndExecCalculation(
        calculationWithId
      );
      const { calculation: newCalculation, results } = result;

      set((state) => ({
        calculations: [...state.calculations, newCalculation],
      }));

      console.log("DataLayerProvider addCalculation: executed");

      // Update column cache to include the new virtual column and any dependent columns
      set((state) => {
        const newColumnCache = { ...state.columnCache };

        // Add all affected columns to the cache
        for (const [columnName, columnData] of Object.entries(results)) {
          newColumnCache[columnName] = columnData;
        }

        return { columnCache: newColumnCache, nonce: state.nonce + 1 };
      });

      return newCalculation;
    },

    removeCalculation: (id) => {
      const { calculationManager } = get();
      if (!calculationManager) {
        throw new Error("Calculation manager not initialized");
      }

      const calculation = calculationManager.getCalculation(id);
      if (!calculation) {
        return;
      }

      calculationManager.removeCalculation(calculation.resultColumnName);

      set((state) => ({
        calculations: state.calculations.filter((calc) => calc.id !== id),
      }));

      // Remove from column cache
      set((state) => {
        const newColumnCache = { ...state.columnCache };
        if (calculation.resultColumnName in newColumnCache) {
          delete newColumnCache[calculation.resultColumnName];
        }
        return { columnCache: newColumnCache };
      });
    },

    updateCalculation: (id, updates) => {
      const { calculationManager } = get();
      if (!calculationManager) {
        throw new Error("Calculation manager not initialized");
      }

      // Find the calculation by id
      const calculation = get().calculations.find((calc) => calc.id === id);
      if (!calculation) {
        return;
      }

      calculationManager.updateCalculation(
        calculation.resultColumnName,
        updates
      );

      set((state) => ({
        calculations: state.calculations.map((calc) =>
          calc.id === id ? { ...calc, ...updates } : calc
        ),
      }));

      // If the calculation was updated, re-execute it
      if (updates.expression || updates.isActive !== undefined) {
        const updatedCalc = calculationManager.getCalculation(
          updates.resultColumnName || calculation.resultColumnName
        );
        if (updatedCalc && updatedCalc.isActive) {
          calculationManager.executeCalculation(updatedCalc);
        }
      }

      // Update column cache if the result column name changed
      if (updates.resultColumnName) {
        set((state) => {
          const virtualColumns = calculationManager.getVirtualColumns();
          const newColumnCache = { ...state.columnCache };

          // Remove old column name from cache
          const oldCalc = state.calculations.find((calc) => calc.id === id);
          if (oldCalc && oldCalc.resultColumnName in newColumnCache) {
            delete newColumnCache[oldCalc.resultColumnName];
          }

          // Add new column name to cache
          if (
            updates.resultColumnName &&
            updates.resultColumnName in virtualColumns
          ) {
            newColumnCache[updates.resultColumnName] =
              virtualColumns[updates.resultColumnName];
          }

          return { columnCache: newColumnCache };
        });
      }
    },

    executeCalculations: async () => {
      const { calculationManager } = get();
      if (!calculationManager) {
        throw new Error("Calculation manager not initialized");
      }

      await calculationManager.executeCalculations();

      // Update column cache with virtual columns
      set((state) => {
        const virtualColumns = calculationManager.getVirtualColumns();
        const newColumnCache = { ...state.columnCache };

        for (const [columnName, columnData] of Object.entries(virtualColumns)) {
          newColumnCache[columnName] = columnData;
        }

        return { columnCache: newColumnCache };
      });
    },

    getVirtualColumns: () => {
      const { calculationManager } = get();
      if (!calculationManager) {
        return {};
      }

      return calculationManager.getVirtualColumns();
    },

    getCalculationResultForRow: (calculationId, rowId) => {
      const { calculationManager } = get();
      if (!calculationManager) {
        return undefined;
      }

      return calculationManager.getCalculationResultForRow(
        calculationId,
        rowId
      );
    },
  }));
};

// Create context
export const DataLayerContext = createContext<DataLayerStore<any> | null>(null);

// Provider wrapper
type DataLayerProviderProps<T extends DatumObject> = React.PropsWithChildren<
  DataLayerProps<T>
>;

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

type SavedView = {
  version: 1;
  charts: ChartSettings[];
  name: string;
  calculations?: CalculationDefinition[];
};

type SavedProject = {
  version: 1;
  name: string;
  sourceDataPath: string;
  views: SavedView[];
  isSaved: boolean;
};

export type { SavedProject, SavedView };
