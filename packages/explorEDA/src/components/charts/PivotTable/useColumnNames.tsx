import { useDataLayer } from "@/providers/DataLayerProvider";

export function useColumnNames() {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const availableFields = getColumnNames();

  return availableFields;
}
