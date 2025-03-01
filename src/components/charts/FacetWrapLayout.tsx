import { ReactNode, useMemo } from "react";

interface FacetData {
  id: string;
  rowValue: string;
  columnValue: string | null;
  ids: string[];
}

interface FacetWrapLayoutProps {
  width: number;
  height: number;
  rowVariable: string;
  columns: number;
  facetData: FacetData[];
  renderChart: (
    facetData: string[],
    facetValue: string,
    facetId: string
  ) => ReactNode;
}

export function FacetWrapLayout({
  width,
  height,
  rowVariable,
  columns,
  facetData,
  renderChart,
}: FacetWrapLayoutProps) {
  // Calculate dimensions
  const facetWidth = width / (columns || 1);
  const rows = Math.ceil(facetData.length / (columns || 1));
  const facetHeight = height / (rows || 1);

  return (
    <div
      className="w-full h-full grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${columns || 1}, 1fr)`,
        gridAutoRows: `${facetHeight}px`,
      }}
    >
      {facetData.map((facet) => (
        <div key={facet.id} className="border p-2">
          <div className="font-medium mb-1">{facet.rowValue}</div>
          <div style={{ height: facetHeight - 30 }}>
            {renderChart(facet.ids, facet.rowValue, facet.id)}
          </div>
        </div>
      ))}
    </div>
  );
}
