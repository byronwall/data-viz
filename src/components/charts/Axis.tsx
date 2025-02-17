import { ScaleBand, ScaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { axisBottom, axisLeft } from "d3-axis";
import { useEffect, useRef } from "react";

type Scale = ScaleLinear<number, number> | ScaleBand<string>;

interface AxisProps {
  scale: Scale;
  transform: string;
  className?: string;
}

export function XAxis({ scale, transform }: AxisProps) {
  const axisRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (axisRef.current) {
      const axis = axisBottom(scale);
      select(axisRef.current).call(axis);
    }
  }, [scale]);

  return (
    <g
      ref={axisRef}
      transform={transform}
      className="text-sm fill-foreground"
    />
  );
}

export function YAxis({ scale, transform }: AxisProps) {
  const axisRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (axisRef.current) {
      const axis = axisLeft(scale);
      select(axisRef.current).call(axis);
    }
  }, [scale]);

  return (
    <g
      ref={axisRef}
      transform={transform}
      className="text-sm fill-foreground"
    />
  );
}
