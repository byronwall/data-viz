import { BaseChartProps } from "@/types/ChartTypes";
import { useChartData } from "@/hooks/useChartData";
import { scaleBand, scaleLinear } from "d3-scale";
import { useMemo } from "react";

type BarChartProps = BaseChartProps;

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

  console.log(chartData);

  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold mb-2">{settings.title}</h3>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y-axis */}
          {yScale.ticks(5).map((tick) => (
            <g key={tick} transform={`translate(0,${yScale(tick)})`}>
              <line
                x2={innerWidth}
                className="stroke-gray-200"
                strokeDasharray="5,5"
              />
              <text
                x={-8}
                y={4}
                className="text-xs fill-gray-500"
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Bars */}
          {chartData.map((d, i) => (
            <g key={i}>
              <rect
                x={xScale(d.label)}
                y={yScale(d.value)}
                width={xScale.bandwidth()}
                height={innerHeight - yScale(d.value)}
                className="fill-blue-500 hover:fill-blue-600 transition-colors"
              />
            </g>
          ))}

          {/* X-axis */}
          {chartData.map((d) => (
            <g
              key={d.label}
              transform={`translate(${
                xScale(d.label)! + xScale.bandwidth() / 2
              },${innerHeight + 8})`}
            >
              <text
                className="text-xs fill-gray-500"
                textAnchor="middle"
                transform="rotate(45)"
              >
                {d.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
