import { IdType, useDataLayer } from "@/providers/DataLayerProvider";
import { useMemo } from "react";

export function useGetColumnData(field: string | undefined) {
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const nonce = useDataLayer((s) => s.nonce);

  return useMemo(() => {
    return getColumnData(field);
    // include the nonce since it tracks updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, field, getColumnData]);
}

export function useGetColumnDataForIds(
  field: string | undefined,
  ids: IdType[] | undefined
) {
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const nonce = useDataLayer((s) => s.nonce);

  return useMemo(() => {
    const data = getColumnData(field);

    if (!ids) {
      return Object.values(data);
    }

    return ids.map((id) => data[id]);

    // include the nonce since it tracks updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, field, getColumnData, ids]);
}
