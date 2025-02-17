import { BaseChartProps } from "@/types/ChartTypes";
import { useChartData } from "@/hooks/useChartData";
import { scaleLinear, scaleBand } from "d3-scale";
import { useMemo } from "react";

type RowChartProps = BaseChartProps & {
  settings: {
    field: string;
    minRowHeight: number;
    maxRowHeight: number;
  };
};

export function RowChart({ settings, width, height }: RowChartProps) {
  const { getColumnData } = useChartData();
  const data = getColumnData(settings.field);

  // Chart dimensions
  const margin = { top: 20, right: 20, bottom: 30, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Calculate counts and handle overflow
  const { displayCounts, hasOthers, othersCount } = useMemo(() => {
    const countMap = new Map<string, number>();
    data.forEach((value) => {
      const key = String(value);
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    // Convert to array and sort by count descending
    const sortedCounts = Array.from(countMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate how many rows we can fit based on min and max row height constraints
    const availableHeight = height - margin.top - margin.bottom;
    const rowHeight = Math.max(
      settings.minRowHeight,
      Math.min(settings.maxRowHeight, availableHeight / sortedCounts.length)
    );
    const maxRows = Math.floor(availableHeight / rowHeight);

    // If we have more items than we can display, create an "Others" category
    if (sortedCounts.length > maxRows) {
      const visibleCounts = sortedCounts.slice(0, maxRows - 1);
      const otherSum = sortedCounts
        .slice(maxRows - 1)
        .reduce((sum, item) => sum + item.count, 0);

      return {
        displayCounts: [...visibleCounts, { label: "Others", count: otherSum }],
        hasOthers: true,
        othersCount: sortedCounts.length - (maxRows - 1),
      };
    }

    return {
      displayCounts: sortedCounts,
      hasOthers: false,
      othersCount: 0,
    };
  }, [
    data,
    height,
    margin.top,
    margin.bottom,
    settings.minRowHeight,
    settings.maxRowHeight,
  ]);

  // Scales
  const xScale = scaleLinear()
    .domain([0, Math.max(...displayCounts.map((d) => d.count))])
    .range([0, innerWidth]);

  const yScale = scaleBand()
    .domain(displayCounts.map((d) => d.label))
    .range([0, innerHeight])
    .padding(0.1);

  return (
    <div style={{ width, height }}>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y axis labels */}
          {displayCounts.map(({ label }) => (
            <text
              key={label}
              x={-5}
              y={yScale(label)! + yScale.bandwidth() / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-sm fill-foreground"
            >
              {label}
              {label === "Others" && hasOthers && ` (${othersCount} items)`}
            </text>
          ))}

          {/* Bars */}
          {displayCounts.map(({ label, count }) => (
            <rect
              key={label}
              x={0}
              y={yScale(label)}
              width={xScale(count)}
              height={yScale.bandwidth()}
              className={`${
                label === "Others"
                  ? "fill-muted/80 hover:fill-muted"
                  : "fill-primary/80 hover:fill-primary"
              }`}
            />
          ))}

          {/* X axis */}
          <line
            x1={0}
            y1={innerHeight}
            x2={innerWidth}
            y2={innerHeight}
            className="stroke-border"
          />

          {/* Count labels */}
          {displayCounts.map(({ label, count }) => (
            <text
              key={label}
              x={xScale(count) + 5}
              y={yScale(label)! + yScale.bandwidth() / 2}
              dominantBaseline="middle"
              className="text-sm fill-foreground"
            >
              {count}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
