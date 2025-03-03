import { IdType, useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings, ScatterChartSettings, datum } from "@/types/ChartTypes";
import { useMemo } from "react";

export function useGetLiveData(
  settings: ChartSettings,
  field?: "xField" | "yField",
  facetIds?: IdType[]
) {
  const getLiveItems = useDataLayer((s) => s.getLiveItems);
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const nonce = useDataLayer((s) => s.nonce);

  const liveItems = getLiveItems(settings);

  const data = useMemo(() => {
    if (!liveItems) {
      return [];
    }

    const facetIdSet = new Set(facetIds);

    const liveIds = liveItems.items
      .filter((c) => c.value > 0)
      .filter((c) =>
        facetIds && facetIds.length > 0 ? facetIdSet.has(c.key) : true
      )
      .map((d) => d.key);

    let _data: Record<string, datum> = {};

    if (settings.type === "row" || settings.type === "bar") {
      _data = getColumnData(settings.field);
    } else if (settings.type === "scatter") {
      const scatterSettings = settings as ScatterChartSettings;
      if (field === "xField") {
        _data = getColumnData(scatterSettings.xField);
      } else if (field === "yField") {
        _data = getColumnData(scatterSettings.yField);
      }
    }

    const data = liveIds.map((id) => _data[id]);

    return data as datum[];
    // TODO: this should really be the nonce
  }, [nonce, field, getColumnData, liveItems?.items, settings, facetIds]);

  return data;
}

export function useGetLiveIds(settings: ChartSettings) {
  const getLiveItems = useDataLayer((s) => s.getLiveItems);
  const nonce = useDataLayer((s) => s.nonce);

  const liveItems = getLiveItems(settings);

  // useMemo against the nonce
  return useMemo(() => {
    if (!liveItems) {
      return [];
    }

    return liveItems.items.filter((c) => c.value > 0).map((d) => d.key);

    // need the nonce to trigger a re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, liveItems?.items]);
}

export function useGetAllIds() {
  const getColumnData = useDataLayer((s) => s.getColumnData);

  const allIds = useMemo(() => {
    const data = getColumnData("__ID") as Record<IdType, datum>;
    return Object.values(data) as IdType[];
  }, [getColumnData]);

  return allIds;
}
