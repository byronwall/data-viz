import { ChartSettings } from "@/types/ChartTypes";
import { useChartData } from "@/hooks/useChartData";
import { scaleLinear, scaleBand } from "d3-scale";
import { useMemo } from "react";

type Props = {
  settings: ChartSettings;
};

export function RowChart({ settings }: Props) {
  const { getColumnData } = useChartData();
  const data = getColumnData(settings.field);

  // Calculate counts for each unique value
  const counts = useMemo(() => {
    const countMap = new Map<string, number>();
    data.forEach((value) => {
      const key = String(value);
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    // Convert to array and sort by count descending
    return Array.from(countMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // Chart dimensions
  const width = 400;
  const height = Math.max(100, counts.length * 30); // 30px per row
  const margin = { top: 20, right: 20, bottom: 30, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = scaleLinear()
    .domain([0, Math.max(...counts.map((d) => d.count))])
    .range([0, innerWidth]);

  const yScale = scaleBand()
    .domain(counts.map((d) => d.label))
    .range([0, innerHeight])
    .padding(0.1);

  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold mb-2">{settings.title}</h3>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y axis labels */}
          {counts.map(({ label }) => (
            <text
              key={label}
              x={-5}
              y={yScale(label)! + yScale.bandwidth() / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-sm fill-foreground"
            >
              {label}
            </text>
          ))}

          {/* Bars */}
          {counts.map(({ label, count }) => (
            <rect
              key={label}
              x={0}
              y={yScale(label)}
              width={xScale(count)}
              height={yScale.bandwidth()}
              className="fill-primary/80 hover:fill-primary"
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
          {counts.map(({ label, count }) => (
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
