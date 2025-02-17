import { ReactNode } from "react";
import { ScaleBand, ScaleLinear } from "d3-scale";
import { XAxis, YAxis } from "./Axis";

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface BaseChartProps {
  width: number;
  height: number;
  margin?: Margin;
  xScale: ScaleLinear<number, number> | ScaleBand<string>;
  yScale: ScaleLinear<number, number> | ScaleBand<string>;
  children: ReactNode;
}

export function BaseChart({
  width,
  height,
  margin = { top: 20, right: 20, bottom: 30, left: 60 },
  xScale,
  yScale,
  children,
}: BaseChartProps) {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  return (
    <svg width={width} height={height} className="select-none">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Main content */}
        {children}

        {/* Axes */}
        <XAxis scale={xScale} transform={`translate(0,${innerHeight})`} />
        <YAxis scale={yScale} transform="translate(0,0)" />
      </g>
    </svg>
  );
}
