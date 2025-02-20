import { useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings } from "@/types/ChartTypes";
import { useMemo } from "react";
import { useWhatChanged } from "./useWhatChanged";

export function useGetLiveData(settings: ChartSettings) {
  const getLiveItems = useDataLayer((s) => s.getLiveItems);
  const getColumnData = useDataLayer((s) => s.getColumnData);

  const liveItems = getLiveItems(settings);

  const data = useMemo(() => {
    const liveIds = liveItems.filter((c) => c.value > 0).map((d) => d.key);

    const _data =
      settings.type === "row"
        ? getColumnData(settings.field)
        : settings.type === "bar"
        ? getColumnData(settings.field)
        : [];

    const data = liveIds.map((id) => _data[id]);

    return data;
  }, [getColumnData, liveItems, settings.field, settings.type]);

  useWhatChanged(
    [getColumnData, liveItems, settings],
    `[getColumnData, liveItems, settings]`
  );

  return data;
}
