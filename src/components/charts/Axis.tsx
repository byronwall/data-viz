import { ScaleBand, ScaleLinear } from "d3-scale";

type Scale = ScaleLinear<number, number> | ScaleBand<string>;

interface AxisProps {
  scale: Scale;
  transform: string;
  className?: string;
  tickCount?: number;
  showGridLines?: boolean;
}

export function XAxis({
  scale,
  transform,
  tickCount = 5,
  showGridLines = false,
}: AxisProps) {
  // Helper function to get ticks
  const getTicks = () => {
    if ("ticks" in scale) {
      // For linear scales
      return scale.ticks(tickCount);
    } else {
      // For band scales
      return scale.domain();
    }
  };

  const ticks = getTicks();
  const range = scale.range();
  const axisLength = range[1] - range[0];

  return (
    <g transform={transform} className="text-sm fill-foreground">
      {/* Main axis line */}
      <line
        x1={range[0]}
        x2={range[1]}
        y1={0}
        y2={0}
        className="stroke-border"
      />

      {/* Ticks and labels */}
      {ticks.map((tick, i) => {
        const x =
          "bandwidth" in scale
            ? scale(tick as string)! + scale.bandwidth() / 2
            : scale(tick as number);

        return (
          <g key={i} transform={`translate(${x}, 0)`}>
            {/* Tick line */}
            <line x1={0} x2={0} y1={0} y2={6} className="stroke-border" />
            {/* Grid line */}
            {showGridLines && (
              <line
                x1={0}
                x2={0}
                y1={0}
                y2={-axisLength}
                className="stroke-border/20 stroke-dasharray-2"
              />
            )}
            {/* Label */}
            <text
              x={0}
              y={20}
              textAnchor="middle"
              className="fill-muted-foreground text-xs"
            >
              {tick}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function YAxis({
  scale,
  transform,
  tickCount = 5,
  showGridLines = false,
}: AxisProps) {
  // Helper function to get ticks
  const getTicks = () => {
    if ("ticks" in scale) {
      // For linear scales
      return scale.ticks(tickCount);
    } else {
      // For band scales
      return scale.domain();
    }
  };

  const ticks = getTicks();
  const range = scale.range();
  const axisLength = range[0] - range[1];

  return (
    <g transform={transform} className="text-sm fill-foreground">
      {/* Main axis line */}
      <line
        x1={0}
        x2={0}
        y1={range[1]}
        y2={range[0]}
        className="stroke-border"
      />

      {/* Ticks and labels */}
      {ticks.map((tick, i) => {
        const y =
          "bandwidth" in scale
            ? scale(tick as string)! + scale.bandwidth() / 2
            : scale(tick as number);

        return (
          <g key={i} transform={`translate(0, ${y})`}>
            {/* Tick line */}
            <line x1={0} x2={-6} y1={0} y2={0} className="stroke-border" />
            {/* Grid line */}
            {showGridLines && (
              <line
                x1={0}
                x2={axisLength}
                y1={0}
                y2={0}
                className="stroke-border/20 stroke-dasharray-2"
              />
            )}
            {/* Label */}
            <text
              x={-12}
              y={0}
              dy="0.32em"
              textAnchor="end"
              className="fill-muted-foreground text-xs"
            >
              {tick}
            </text>
          </g>
        );
      })}
    </g>
  );
}
