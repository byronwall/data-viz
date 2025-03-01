import { ReactNode, createContext, useContext, useRef } from "react";
import isEqual from "react-fast-compare";
import { createStore, useStore } from "zustand";

// Numerical axis limits
interface NumericalAxisLimits {
  type: "numerical";
  min: number;
  max: number;
}

// Categorical axis limits
interface CategoricalAxisLimits {
  type: "categorical";
  categories: Set<string>;
}

// Union type for axis limits
type AxisLimits = NumericalAxisLimits | CategoricalAxisLimits;

interface FacetAxisState {
  axisLimits: {
    x: Record<string, AxisLimits>;
    y: Record<string, AxisLimits>;
  };
  registerAxisLimits: (
    chartId: string,
    axis: "x" | "y",
    limits: AxisLimits
  ) => void;
  getGlobalAxisLimits: (axis: "x" | "y") => AxisLimits | null;
}

// Create the Zustand store
const createFacetAxisStore = () => {
  return createStore<FacetAxisState>()((set, get) => ({
    axisLimits: { x: {}, y: {} },

    registerAxisLimits: (
      chartId: string,
      axis: "x" | "y",
      limits: AxisLimits
    ) => {
      const before = get().axisLimits[axis][chartId];
      const after = limits;

      console.log("before", before);
      console.log("after", after);

      if (before && after && isEqual(before, after)) {
        return;
      }

      console.log("setting axis limits");

      set((state) => ({
        axisLimits: {
          ...state.axisLimits,
          [axis]: {
            ...state.axisLimits[axis],
            [chartId]: limits,
          },
        },
      }));
    },

    getGlobalAxisLimits: (axis: "x" | "y"): AxisLimits | null => {
      const limits = Object.values(get().axisLimits[axis]);
      if (limits.length === 0) {
        return null;
      }

      // Check if all limits are of the same type
      const firstLimitType = limits[0].type;
      const allSameType = limits.every(
        (limit) => limit.type === firstLimitType
      );

      if (!allSameType) {
        console.warn("Mixed axis types detected in facets. Using first type.");
      }

      if (firstLimitType === "numerical") {
        // For numerical limits, find min and max across all charts
        const numericalLimits = limits.filter(
          (limit): limit is NumericalAxisLimits => limit.type === "numerical"
        );

        return {
          type: "numerical",
          min: Math.min(...numericalLimits.map((l) => l.min)),
          max: Math.max(...numericalLimits.map((l) => l.max)),
        };
      } else {
        // For categorical limits, create a union of all categories
        const categoricalLimits = limits.filter(
          (limit): limit is CategoricalAxisLimits =>
            limit.type === "categorical"
        );

        const allCategories = new Set<string>();
        categoricalLimits.forEach((limit) => {
          limit.categories.forEach((category) => {
            allCategories.add(category);
          });
        });

        return {
          type: "categorical",
          categories: allCategories,
        };
      }
    },
  }));
};

// Store type
type FacetAxisStore = ReturnType<typeof createFacetAxisStore>;

// Create a context for the store
const FacetAxisContext = createContext<FacetAxisStore | null>(null);

// Provider component
export function FacetAxisProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<FacetAxisStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createFacetAxisStore();
  }

  return (
    <FacetAxisContext.Provider value={storeRef.current}>
      {children}
    </FacetAxisContext.Provider>
  );
}

// Hook to use the facet axis store
export function useFacetAxis<T>(selector: (state: FacetAxisState) => T): T {
  const store = useContext(FacetAxisContext);
  if (!store) {
    throw new Error("useFacetAxis must be used within a FacetAxisProvider");
  }

  return useStore(store, selector);
}
