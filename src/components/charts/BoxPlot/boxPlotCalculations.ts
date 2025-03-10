import { BoxPlotSettings } from "./definition";

export interface BoxPlotStats {
  q1: number;
  median: number;
  q3: number;
  iqr: number;
  whiskerLow: number;
  whiskerHigh: number;
  outliers: number[];
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
  console.log("Calculating box plot stats for data:", { data, whiskerType });

  if (data.length === 0) {
    console.log("Empty data array, returning zeros");
    return {
      q1: 0,
      median: 0,
      q3: 0,
      iqr: 0,
      whiskerLow: 0,
      whiskerHigh: 0,
      outliers: [],
    };
  }

  const sortedData = [...data].sort((a, b) => a - b);
  const q1 = getQuartile(sortedData, 0.25);
  const median = getQuartile(sortedData, 0.5);
  const q3 = getQuartile(sortedData, 0.75);
  const iqr = q3 - q1;

  console.log("Basic statistics:", { q1, median, q3, iqr });

  let whiskerLow: number;
  let whiskerHigh: number;
  let outliers: number[];

  switch (whiskerType) {
    case "tukey": {
      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;
      console.log("Tukey fences:", { lowerFence, upperFence });

      // Find the lowest value that's not below the lower fence
      whiskerLow = Math.max(lowerFence, sortedData[0]);
      // Find the highest value that's not above the upper fence
      whiskerHigh = Math.min(upperFence, sortedData[sortedData.length - 1]);

      // Ensure whiskerLow is always less than whiskerHigh
      if (whiskerLow > whiskerHigh) {
        // If the fences cross, use the data range
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
      console.log("StdDev stats:", { mean, stdDev });

      whiskerLow = mean - 2 * stdDev;
      whiskerHigh = mean + 2 * stdDev;
      outliers = sortedData.filter((x) => x < whiskerLow || x > whiskerHigh);
      break;
    }
  }

  const result = {
    q1,
    median,
    q3,
    iqr,
    whiskerLow,
    whiskerHigh,
    outliers,
  };

  console.log("Final box plot stats:", result);
  return result;
}

export function calculateKernelDensity(
  data: number[],
  bandwidth: number,
  numPoints: number = 100
): [number, number][] {
  console.log("Starting KDE calculation:", {
    dataLength: data.length,
    bandwidth,
    numPoints,
    dataSample: data.slice(0, 5),
  });

  // Sort data for efficient processing
  const sortedData = [...data].sort((a, b) => a - b);
  const min = sortedData[0];
  const max = sortedData[sortedData.length - 1];
  const range = max - min;

  console.log("Data range:", {
    min,
    max,
    range,
    sortedDataSample: sortedData.slice(0, 5),
  });

  // Create points evenly spaced across the range
  const points = Array.from({ length: numPoints }, (_, i) => {
    const t = i / (numPoints - 1);
    return min + t * range;
  });

  console.log("Generated points:", {
    pointsLength: points.length,
    firstPoint: points[0],
    lastPoint: points[points.length - 1],
    pointsSample: points.slice(0, 5),
  });

  // Calculate KDE at each point
  const density = points.map((x, index) => {
    const sum = sortedData.reduce((acc, xi) => {
      // Gaussian kernel
      const diff = x - xi;
      return acc + Math.exp(-(diff * diff) / (2 * bandwidth * bandwidth));
    }, 0);
    const densityValue =
      sum / (sortedData.length * bandwidth * Math.sqrt(2 * Math.PI));

    if (index === 0 || index === points.length - 1) {
      console.log(`Density calculation for point ${index}:`, {
        x,
        sum,
        densityValue,
        sampleXi: sortedData.slice(0, 3),
      });
    }

    return [x, densityValue] as [number, number];
  });

  // Find the maximum density value for normalization
  const maxDensity = Math.max(...density.map(([_, y]) => y));
  console.log("Maximum density value:", maxDensity);

  // Normalize the density values to be between 0 and 1
  const normalizedDensity = density.map(
    ([x, y]) => [x, y / maxDensity] as [number, number]
  );

  console.log("Final density results:", {
    densityLength: normalizedDensity.length,
    firstDensity: normalizedDensity[0],
    lastDensity: normalizedDensity[normalizedDensity.length - 1],
    densitySample: normalizedDensity.slice(0, 5),
    hasValidValues: normalizedDensity.every(
      ([_, y]) => !isNaN(y) && isFinite(y)
    ),
  });

  return normalizedDensity;
}

export function calculateBeeSwarmPositions(
  data: number[],
  width: number,
  radius: number = 2
): [number, number][] {
  // Sort data for efficient processing
  const sortedData = [...data].sort((a, b) => a - b);
  const positions: [number, number][] = [];
  const usedPositions: Set<string> = new Set();

  // Helper function to check if a position is available
  const isPositionAvailable = (x: number, y: number): boolean => {
    const key = `${x.toFixed(2)},${y.toFixed(2)}`;
    return !usedPositions.has(key);
  };

  // Helper function to mark a position as used
  const markPositionUsed = (x: number, y: number) => {
    const key = `${x.toFixed(2)},${y.toFixed(2)}`;
    usedPositions.add(key);
  };

  // Try to place each point
  for (const value of sortedData) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loops

    while (!placed && attempts < maxAttempts) {
      // Try different x positions
      for (let x = 0; x <= width; x += radius * 2) {
        if (isPositionAvailable(x, value)) {
          positions.push([x, value]);
          markPositionUsed(x, value);
          placed = true;
          break;
        }
      }

      if (!placed) {
        // If we couldn't place the point, try a random position
        const randomX = Math.random() * width;
        positions.push([randomX, value]);
        markPositionUsed(randomX, value);
        placed = true;
      }

      attempts++;
    }
  }

  return positions;
}
