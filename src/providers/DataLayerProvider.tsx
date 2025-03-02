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
  charts?: ChartSettings[];
}

// Add ID to the data type
type IdType = number;
export type HasId = { __ID: IdType };

interface DataLayerState<T extends DatumObject> extends DataLayerProps<T> {
  data: (T & HasId)[];
  emptyColumn: Record<IdType, datum>;
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
  getLiveItems: (chart: ChartSettings) => LiveItem | undefined;

  // data and key functions
  getColumnData: (field: string | undefined) => Record<IdType, datum>;
  getColumnNames: () => string[];
  columnCache: Record<string, Record<IdType, datum>>;

  // Project and View Management
  currentProject: SavedProject | null;
  setCurrentProject: (project: SavedProject) => void;
  saveCurrentView: (name: string) => void;
  loadView: (view: SavedView) => void;

  // Calculation state
  calculationManager: CalculationManager<T>;
  calculations: CalculationDefinition[];
  addCalculation: (
    calculation: Omit<CalculationDefinition, "id">
  ) => Promise<CalculationDefinition>;
  removeCalculation: (resultColumnName: string) => void;
  updateCalculation: (
    resultColumnName: string,
    newCalculation: CalculationDefinition
  ) => void;

  calcColumnCache: Record<string, Record<IdType, datum> | undefined>;
}

// Store type
type DataLayerStore<T extends DatumObject> = ReturnType<
  typeof createDataLayerStore<T>
>;

function getDataAndCrossfilterWrapper<T extends DatumObject>(
  data: T[],
  fieldGetter?: (name: string) => Record<IdType, datum>,
  charts?: ChartSettings[]
): Partial<DataLayerState<T>> {
  const dataWithIds = data.map((row, index) => ({
    ...row,
    __ID: index,
  }));
  const newCrossFilter = new CrossfilterWrapper<T & HasId>(
    dataWithIds,
    (d) => d.__ID
  );

  if (fieldGetter) {
    newCrossFilter.setFieldGetter(fieldGetter);
  }

  if (charts) {
    charts.forEach((chart) => {
      newCrossFilter.addChart(chart);
    });
  }

  return {
    data: dataWithIds,
    emptyColumn: data.reduce((acc, row) => {
      acc[row.__ID as IdType] = undefined;
      return acc;
    }, {} as Record<IdType, datum>),
    crossfilterWrapper: newCrossFilter,
    charts: charts ?? [],
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
    calculationManager: ogCalculationManager,
  } = getDataAndCrossfilterWrapper(
    initProps?.data ?? [],
    undefined,
    initProps?.charts ?? []
  );

  if (!crossfilterWrapper || !initData || !ogCalculationManager) {
    throw new Error(
      "Data, crossfilterWrapper, or calculationManager not found"
    );
  }

  const store = createStore<DataLayerState<T>>()((set, get) => ({
    data: initData,
    emptyColumn: initData.reduce((acc, row) => {
      acc[row.__ID as IdType] = undefined;
      return acc;
    }, {} as Record<IdType, datum>),
    fileName: undefined,
    crossfilterWrapper,
    calculationManager: ogCalculationManager,
    calculations: [],
    setData: (rawData, fileName) => {
      // Get fresh crossfilter and data with IDs
      const {
        data: newData,
        crossfilterWrapper: newCrossfilter,
        calculationManager: newCalculationManager,
      } = getDataAndCrossfilterWrapper(rawData, get().getColumnData);

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
        calcColumnCache: {},
        nonce: 0,
        currentProject: null,
      });
    },
    liveItems: {},

    // Chart management
    charts: initProps?.charts ?? [],
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

      console.warn("updateChart", { id, settings });

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

      const liveItemsForChart = liveItems[chart.id] ?? undefined;

      return liveItemsForChart;
    },

    getColumnNames() {
      const { data, calculations } = get();
      const baseColumns = Object.keys(data[0] || {});

      const calcFields = calculations.map((calc) => calc.resultColumnName);

      return [...baseColumns, ...calcFields];
    },

    getColumnData(field: string | undefined) {
      const {
        columnCache,
        data,
        calcColumnCache,
        calculations,
        emptyColumn,
        calculationManager,
      } = get();

      if (!field) {
        return emptyColumn;
      }

      if (columnCache[field]) {
        return columnCache[field];
      }

      const calculation = calculations.find(
        (calc) => calc.resultColumnName === field
      );

      if (calculation) {
        if (calcColumnCache[field]) {
          return calcColumnCache[field];
        }

        // Otherwise, calculate the column data
        // TODO: Implement calculation in the manager for whole column
        // needs to account for dependencies
        const resultMap = calculationManager.executeCalculation(calculation);

        // convert to Record<IdType, datum>
        const columnData: { [key: IdType]: datum } = {};
        resultMap.forEach((value, key) => {
          columnData[key] = value;
        });

        // update the column cache
        set((state) => {
          const newCalcColumnCache = { ...state.calcColumnCache };
          newCalcColumnCache[field] = columnData;
          return { calcColumnCache: newCalcColumnCache };
        });

        return columnData;
      }

      // check if field is in the data -- if not, return all undefined
      // do not add to column cache
      if (!data.some((row) => field in row)) {
        return emptyColumn;
      }

      // Otherwise, it's a regular column
      const columnData: { [key: IdType]: datum } = {};
      data.forEach((row) => {
        columnData[row.__ID] = row[field];
      });

      set((state) => {
        const newColumnCache = { ...state.columnCache };
        newColumnCache[field] = columnData;
        return { columnCache: newColumnCache };
      });

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
            try {
              await calculationManager.addCalculation(calc);
              newCalculations.push(calc);
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

      const affectedColumns = calculationManager.addCalculation(calculation);

      set((state) => {
        const newCalculations = [...state.calculations, calculation];
        const newCalcColumnCache = { ...state.calcColumnCache };
        for (const columnName of affectedColumns) {
          newCalcColumnCache[columnName] = undefined;
        }
        return {
          calculations: newCalculations,
          calcColumnCache: newCalcColumnCache,
          nonce: state.nonce + 1,
        };
      });

      return calculation;
    },

    removeCalculation: (resultColumnName) => {
      const { calculationManager } = get();
      if (!calculationManager) {
        throw new Error("Calculation manager not initialized");
      }

      calculationManager.removeCalculation(resultColumnName);

      set((state) => ({
        calculations: state.calculations.filter(
          (calc) => calc.resultColumnName !== resultColumnName
        ),
      }));

      // Remove from column cache
      set((state) => {
        const newColumnCache = { ...state.columnCache };
        if (resultColumnName in newColumnCache) {
          delete newColumnCache[resultColumnName];
        }
        return { columnCache: newColumnCache };
      });
    },

    calcColumnCache: {},

    updateCalculation: (resultColumnName, newCalculation) => {
      const { addCalculation, removeCalculation } = get();

      removeCalculation(resultColumnName);
      addCalculation(newCalculation);
    },
  }));

  // this madness passes the column getter back into the crossfilter wrapper
  // this ensures that crossfilter has access to calculated fields
  crossfilterWrapper.setFieldGetter(store.getState().getColumnData);

  return store;
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
