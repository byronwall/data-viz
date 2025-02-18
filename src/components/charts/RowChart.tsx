import { BaseChartProps, RowChartSettings } from "@/types/ChartTypes";
import { useChartData } from "@/hooks/useChartData";
import { scaleLinear, scaleBand } from "d3-scale";
import { useMemo } from "react";
import { BaseChart } from "./BaseChart";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { rowChartPureFilter } from "@/hooks/rowChartPureFilter";

type RowChartProps = BaseChartProps & {
  settings: RowChartSettings;
};

export function RowChart({ settings, width, height }: RowChartProps) {
  const { getColumnData, getLiveIdsForDimension } = useChartData();

  const liveIds = getLiveIdsForDimension(settings);

  const _data = getColumnData(settings.field);

  const data = liveIds.map((id) => _data[id]);

  const updateChart = useDataLayer((s) => s.updateChart);

  const filters = settings.rowFilters?.values ?? [];

  const handleBarClick = (label: string) => {
    if (label === "Others") {
      return;
    } // Don't allow filtering on "Others" category

    const newValues = filters.includes(label)
      ? filters.filter((f) => f !== label)
      : [...filters, label];

    updateChart(settings.id, {
      ...settings,
      rowFilters: { values: newValues },
    });
  };

  // Chart dimensions
  const margin = { top: 20, right: 40, bottom: 30, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Calculate counts and handle overflow
  const { displayCounts } = useMemo(() => {
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
      };
    }

    return {
      displayCounts: sortedCounts,
    };
  }, [
    data,
    height,
    margin.top,
    margin.bottom,
    settings.minRowHeight,
    settings.maxRowHeight,
  ]);

  console.log("displayCounts", displayCounts);

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
      <BaseChart
        width={width}
        height={height}
        margin={margin}
        xScale={xScale}
        yScale={yScale}
      >
        <g className="select-none">
          {/* Bars */}
          {displayCounts.map(({ label, count }) => {
            const isFiltered = rowChartPureFilter(filters, label);

            return (
              <rect
                key={label}
                x={0}
                y={yScale(label)}
                width={xScale(count)}
                height={yScale.bandwidth()}
                className={`${
                  label === "Others"
                    ? "fill-muted/80 hover:fill-muted"
                    : isFiltered
                    ? "fill-primary hover:fill-primary/90"
                    : "fill-primary/80 hover:fill-primary"
                } cursor-pointer`}
                onClick={() => handleBarClick(label)}
              />
            );
          })}

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
      </BaseChart>
    </div>
  );
}
