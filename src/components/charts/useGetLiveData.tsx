import { useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings, datum } from "@/types/ChartTypes";
import { useMemo } from "react";

export function useGetLiveData(
  settings: ChartSettings,
  field?: "xField" | "yField"
) {
  const getLiveItems = useDataLayer((s) => s.getLiveItems);
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const nonce = useDataLayer((s) => s.nonce);

  const liveItems = getLiveItems(settings);

  const data = useMemo(() => {
    const liveIds = liveItems.items
      .filter((c) => c.value > 0)
      .map((d) => d.key);

    const _data =
      settings.type === "row"
        ? getColumnData(settings.field)
        : settings.type === "bar"
        ? getColumnData(settings.field)
        : settings.type === "scatter"
        ? field === "xField"
          ? getColumnData(settings.xField)
          : field === "yField"
          ? getColumnData(settings.yField)
          : []
        : [];

    const data = liveIds.map((id) => _data[id]);

    return data as datum[];
    // TODO: this should really be the nonce
  }, [
    nonce,
    field,
    getColumnData,
    liveItems.items,
    settings.field,
    settings.type,
    settings.xField,
    settings.yField,
  ]);

  return data;
}
