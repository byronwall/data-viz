import { BoxPlotSettings } from "./definition";

export interface BoxPlotStats {
  q1: number;
  median: number;
  q3: number;
  iqr: number;
  whiskerLow: number;
  whiskerHigh: number;
  outliers: number[];
  totalCount: number;
}

function getQuartile(sortedData: number[], q: number): number {
  const pos = (sortedData.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedData[base + 1] !== undefined) {
    return sortedData[base] + rest * (sortedData[base + 1] - sortedData[base]);
  } else {
    return sortedData[base];
  }
}

export function calculateBoxPlotStats(
  data: number[],
  whiskerType: BoxPlotSettings["whiskerType"]
): BoxPlotStats {
  if (data.length === 0) {
    return {
      q1: 0,
      median: 0,
      q3: 0,
      iqr: 0,
      whiskerLow: 0,
      whiskerHigh: 0,
      outliers: [],
      totalCount: 0,
    };
  }

  const sortedData = [...data].sort((a, b) => a - b);
  const q1 = getQuartile(sortedData, 0.25);
  const median = getQuartile(sortedData, 0.5);
  const q3 = getQuartile(sortedData, 0.75);
  const iqr = q3 - q1;

  let whiskerLow: number;
  let whiskerHigh: number;
  let outliers: number[];

  switch (whiskerType) {
    case "tukey": {
      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;

      whiskerLow = Math.max(lowerFence, sortedData[0]);
      whiskerHigh = Math.min(upperFence, sortedData[sortedData.length - 1]);

      if (whiskerLow > whiskerHigh) {
        whiskerLow = sortedData[0];
        whiskerHigh = sortedData[sortedData.length - 1];
      }

      outliers = sortedData.filter((x) => x < whiskerLow || x > whiskerHigh);
      break;
    }
    case "minmax": {
      whiskerLow = sortedData[0];
      whiskerHigh = sortedData[sortedData.length - 1];
      outliers = [];
      break;
    }
    case "stdDev": {
      const mean =
        sortedData.reduce((sum, x) => sum + x, 0) / sortedData.length;
      const stdDev = Math.sqrt(
        sortedData.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) /
          sortedData.length
      );

      whiskerLow = mean - 2 * stdDev;
      whiskerHigh = mean + 2 * stdDev;
      outliers = sortedData.filter((x) => x < whiskerLow || x > whiskerHigh);
      break;
    }
  }

  return {
    q1,
    median,
    q3,
    iqr,
    whiskerLow,
    whiskerHigh,
    outliers,
    totalCount: data.length,
  };
}

export function calculateKernelDensity(
  data: number[],
  bandwidth: number,
  numPoints: number = 100
): [number, number][] {
  const sortedData = [...data].sort((a, b) => a - b);
  const min = sortedData[0];
  const max = sortedData[sortedData.length - 1];
  const range = max - min;

  const points = Array.from({ length: numPoints }, (_, i) => {
    const t = i / (numPoints - 1);
    return min + t * range;
  });

  const density = points.map((x) => {
    const sum = sortedData.reduce((acc, xi) => {
      const diff = x - xi;
      return acc + Math.exp(-(diff * diff) / (2 * bandwidth * bandwidth));
    }, 0);
    const densityValue =
      sum / (sortedData.length * bandwidth * Math.sqrt(2 * Math.PI));

    return [x, densityValue] as [number, number];
  });

  const maxDensity = Math.max(...density.map(([_, y]) => y));

  return density.map(([x, y]) => [x, y / maxDensity] as [number, number]);
}

export function calculateBeeSwarmPositions(
  data: number[],
  width: number,
  maxPoints: number = 1000
): [number, number][] {
  if (data.length > maxPoints) {
    const sampledData = [...data]
      .sort(() => Math.random() - 0.5)
      .slice(0, maxPoints);
    return calculateBeeSwarmPositionsForData(sampledData, width);
  }
  return calculateBeeSwarmPositionsForData(data, width);
}

function calculateBeeSwarmPositionsForData(
  data: number[],
  width: number
): [number, number][] {
  const positions: [number, number][] = [];
  const radius = 2;
  const spacing = radius * 2;

  const sortedData = [...data].sort((a, b) => a - b);

  for (const value of sortedData) {
    let x = 0;
    const y = value;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const overlaps = positions.some(([px, py]) => {
        const dx = x - px;
        const dy = y - py;
        return Math.sqrt(dx * dx + dy * dy) < spacing;
      });

      if (!overlaps) {
        break;
      }

      x = (x + spacing) % width;
      attempts++;
    }

    positions.push([x, y]);
  }

  return positions;
}
