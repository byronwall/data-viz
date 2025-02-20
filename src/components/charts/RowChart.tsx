import { BaseChartProps, datum, RowChartSettings } from "@/types/ChartTypes";

import { scaleLinear, scaleBand } from "d3-scale";
import { useMemo } from "react";
import { BaseChart } from "./BaseChart";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { rowChartPureFilter } from "@/hooks/rowChartPureFilter";

type RowChartProps = BaseChartProps & {
  settings: RowChartSettings;
};

export function RowChart({ settings, width, height }: RowChartProps) {
  const getColumnData = useDataLayer((s) => s.getColumnData);

  const getLiveItems = useDataLayer((s) => s.getLiveItems);

  const liveItems = getLiveItems(settings);

  const liveIds = liveItems.filter((c) => c.value > 0).map((d) => d.key);

  const _data = getColumnData(settings.field);

  const data = liveIds.map((id) => _data[id]);

  const updateChart = useDataLayer((s) => s.updateChart);

  const filters = settings.filterValues?.values ?? [];

  const handleBarClick = (label: datum) => {
    if (label === "Others") {
      // Don't allow filtering on "Others" category
      return;
    }

    const newValues = filters.includes(label)
      ? filters.filter((f) => f !== label)
      : [...filters, label];

    console.log("handleBarClick", {
      settings,
      newValues,
    });

    updateChart({
      ...settings,
      filterValues: { values: newValues },
    });
  };

  // Chart dimensions
  const margin = { top: 20, right: 40, bottom: 30, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Calculate counts and handle overflow
  const { displayCounts } = useMemo(() => {
    const countMap = new Map<datum, number>();
    data.forEach((value) => {
      const key = value;
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

  // Scales
  const xScale = scaleLinear()
    .domain([0, Math.max(...displayCounts.map((d) => d.count))])
    .range([0, innerWidth]);

  const yScale = scaleBand()
    .domain(displayCounts.map((d) => String(d.label)))
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
                key={String(label)}
                x={0}
                y={yScale(String(label))}
                width={xScale(count)}
                height={yScale.bandwidth()}
                className={`${
                  label === "Others"
                    ? "fill-muted/80 hover:fill-muted"
                    : filters.length > 0
                    ? isFiltered
                      ? "fill-amber-800"
                      : "fill-amber-200"
                    : "fill-blue-800"
                } cursor-pointer`}
                onClick={() => handleBarClick(label)}
              />
            );
          })}

          {/* Count labels */}
          {displayCounts.map(({ label, count }) => (
            <text
              key={String(label)}
              x={xScale(count) + 5}
              y={yScale(String(label))! + yScale.bandwidth() / 2}
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
