import { ReactNode, useMemo } from "react";

interface FacetData {
  id: string;
  rowValue: string;
  columnValue: string | null;
  ids: string[];
}

interface FacetGridLayoutProps {
  width: number;
  height: number;
  rowVariable: string;
  columnVariable: string;
  facetData: FacetData[];
  renderChart: (
    facetData: string[],
    facetValue: string,
    facetId: string
  ) => ReactNode;
}

export function FacetGridLayout({
  width,
  height,
  rowVariable,
  columnVariable,
  facetData,
  renderChart,
}: FacetGridLayoutProps) {
  // Extract unique row and column values
  const { rows, columns, grid } = useMemo(() => {
    const rows = Array.from(new Set(facetData.map((d) => d.rowValue))).sort();
    const columns = Array.from(
      new Set(
        facetData
          .filter((d) => d.columnValue !== null)
          .map((d) => d.columnValue as string)
      )
    ).sort();

    // Create a grid of facets
    const grid: Record<string, Record<string, string[]>> = {};

    rows.forEach((row) => {
      grid[row] = {};
      columns.forEach((col) => {
        grid[row][col] = [];
      });
    });

    facetData.forEach((facet) => {
      if (facet.rowValue && facet.columnValue) {
        grid[facet.rowValue][facet.columnValue] = facet.ids;
      }
    });

    return { rows, columns, grid };
  }, [facetData]);

  // Calculate cell dimensions
  const cellWidth = width / (columns.length || 1);
  const cellHeight = height / (rows.length || 1);

  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full h-full border-collapse">
        <thead>
          <tr>
            {/* Top-left empty cell */}
            <th className="border p-2 bg-muted/50 font-semibold">
              {rowVariable} / {columnVariable}
            </th>

            {/* Column headers */}
            {columns.map((col) => (
              <th key={col} className="border p-2 bg-muted/50 font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              {/* Row header */}
              <th className="border p-2 bg-muted/50 font-semibold text-left">
                {row}
              </th>

              {/* Facet cells */}
              {columns.map((col) => (
                <td key={`${row}-${col}`} className="border p-0">
                  <div style={{ width: cellWidth, height: cellHeight }}>
                    {grid[row]?.[col]?.length > 0 ? (
                      renderChart(
                        grid[row][col],
                        `${row}, ${col}`,
                        `${row}__${col}`
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No data
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
