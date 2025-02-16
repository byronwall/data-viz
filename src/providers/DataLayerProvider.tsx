import { createStore } from "zustand";
import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";

// Props and State interfaces
interface DataLayerProps<T> {
  data?: T[];
}

interface DataLayerState<T> extends DataLayerProps<T> {
  data: T[];
  setData: (data: T[]) => void;
}

// Store type
type DataLayerStore<T> = ReturnType<typeof createDataLayerStore<T>>;

// Store creator
const createDataLayerStore = <T,>(initProps?: Partial<DataLayerProps<T>>) => {
  const DEFAULT_PROPS: DataLayerProps<T> = {
    data: [],
  };
  return createStore<DataLayerState<T>>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    setData: (data) => set({ data }),
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
  const storeRef = useRef<DataLayerStore<T>>(null);
  if (!storeRef.current) {
    storeRef.current = createDataLayerStore(props);
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
  if (!store) throw new Error("Missing DataLayerContext.Provider in the tree");
  return useStore(store, selector);
}
