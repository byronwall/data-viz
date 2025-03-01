import { useDataLayer } from "@/providers/DataLayerProvider";
import { FacetAxisProvider } from "@/providers/FacetAxisProvider";
import { ChartSettings } from "@/types/ChartTypes";
import { ReactNode, useMemo } from "react";
import { FacetGridLayout } from "./FacetGridLayout";
import { FacetWrapLayout } from "./FacetWrapLayout";
import { useGetLiveIds } from "./useGetLiveData";

interface FacetContainerProps {
  settings: ChartSettings;
  width: number;
  height: number;
  renderChart: (
    facetData: string[],
    facetValue: string,
    facetId: string
  ) => ReactNode;
}

interface FacetData {
  id: string;
  rowValue: string;
  columnValue: string | null;
  ids: string[];
}

export function FacetContainer({
  settings,
  width,
  height,
  renderChart,
}: FacetContainerProps) {
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const liveIds = useGetLiveIds(settings);

  const facetData = useMemo(() => {
    if (!settings.facet?.enabled) {
      return [] as FacetData[];
    }

    const facet = settings.facet;
    const rowVariable = facet.rowVariable;

    if (!rowVariable) {
      return [] as FacetData[];
    }

    const rowData = getColumnData(rowVariable);
    const columnData =
      facet.type === "grid" ? getColumnData(facet.columnVariable) : null;

    // Group data by facet variables
    const facets: Record<string, string[]> = {};

    liveIds.forEach((id) => {
      const rowValue = String(rowData[id] ?? "undefined");
      const colValue = columnData
        ? String(columnData[id] ?? "undefined")
        : null;

      const facetKey = colValue ? `${rowValue}__${colValue}` : rowValue;

      if (!facets[facetKey]) {
        facets[facetKey] = [];
      }

      facets[facetKey].push(id);
    });

    return Object.entries(facets).map(([key, ids]) => {
      let rowValue: string;
      let columnValue: string | null = null;

      if (facet.type === "grid" && key.includes("__")) {
        const parts = key.split("__");
        rowValue = parts[0];
        columnValue = parts[1];
      } else {
        rowValue = key;
      }

      return {
        id: key,
        rowValue,
        columnValue,
        ids,
      };
    }) as FacetData[];
  }, [settings.facet, getColumnData, liveIds]);

  if (!settings.facet?.enabled) {
    return null;
  }

  return (
    <FacetAxisProvider>
      {settings.facet.type === "grid" ? (
        <FacetGridLayout
          width={width}
          height={height}
          rowVariable={settings.facet.rowVariable}
          columnVariable={settings.facet.columnVariable}
          facetData={facetData}
          renderChart={renderChart}
        />
      ) : (
        <FacetWrapLayout
          width={width}
          height={height}
          rowVariable={settings.facet.rowVariable}
          columns={settings.facet.columns}
          facetData={facetData}
          renderChart={renderChart}
        />
      )}
    </FacetAxisProvider>
  );
}
