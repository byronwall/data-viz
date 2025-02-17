import { BaseChartProps, BarChartSettings } from "@/types/ChartTypes";
import { useChartData } from "@/hooks/useChartData";
import { scaleBand, scaleLinear } from "d3-scale";
import { useMemo } from "react";
import { BaseChart } from "./BaseChart";

type BarChartProps = BaseChartProps & {
  settings: BarChartSettings;
};

export function BarChart({ settings, width, height }: BarChartProps) {
  const { getColumnData } = useChartData();
  const data = getColumnData(settings.field);

  // Chart dimensions
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const chartData = useMemo(() => {
    const values = data.map((item) => Number(item));

    // Check if the data is numeric
    const isNumeric = values.every((v) => !isNaN(v));

    if (isNumeric) {
      // Use binning for numeric data
      const binCount = settings.binCount || 30;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binWidth = (max - min) / binCount;

      // Initialize bins
      const bins = Array.from({ length: binCount }, (_, i) => ({
        label: `${(min + i * binWidth).toFixed(1)}-${(
          min +
          (i + 1) * binWidth
        ).toFixed(1)}`,
        start: min + i * binWidth,
        end: min + (i + 1) * binWidth,
        value: 0,
      }));

      // Fill bins
      values.forEach((value) => {
        const binIndex = Math.min(
          Math.floor((value - min) / binWidth),
          binCount - 1
        );
        bins[binIndex].value++;
      });

      return bins;
    } else {
      // Use original categorical logic for non-numeric data
      const counts = data.reduce((acc, item) => {
        const value = String(item);
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts).map(([label, count]) => ({
        label,
        value: count,
      }));
    }
  }, [data, settings.field, settings.binCount]);

  // Create scales
  const xScale = useMemo(
    () =>
      scaleBand()
        .domain(chartData.map((d) => d.label))
        .range([0, innerWidth])
        .padding(0.3),
    [chartData, innerWidth]
  );

  const yScale = useMemo(() => {
    const maxValue = Math.max(...chartData.map((d) => d.value));
    return scaleLinear().domain([0, maxValue]).range([innerHeight, 0]).nice();
  }, [chartData, innerHeight]);

  return (
    <div style={{ width, height }}>
      <BaseChart
        width={width}
        height={height}
        margin={margin}
        xScale={xScale}
        yScale={yScale}
      >
        <g>
          {/* Grid lines */}
          {yScale.ticks(5).map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              className="stroke-gray-200"
              strokeDasharray="5,5"
            />
          ))}

          {/* Bars */}
          {chartData.map((d, i) => (
            <rect
              key={i}
              x={xScale(d.label)}
              y={yScale(d.value)}
              width={xScale.bandwidth()}
              height={innerHeight - yScale(d.value)}
              className="fill-primary/80 hover:fill-primary transition-colors"
            />
          ))}

          {/* Value labels */}
          {chartData.map((d) => (
            <text
              key={d.label}
              x={xScale(d.label)! + xScale.bandwidth() / 2}
              y={yScale(d.value) - 5}
              className="text-xs fill-foreground"
              textAnchor="middle"
            >
              {d.value}
            </text>
          ))}
        </g>
      </BaseChart>
    </div>
  );
}
