import { datum } from "@/types/FilterTypes";
import { PivotCell, PivotHeader, PivotRow, PivotTableData } from "../types";
import { PivotTableSettings } from "../definition";

type AggregationFunction = (values: any[]) => number | string;

const aggregationFunctions: Record<string, AggregationFunction> = {
  sum: (values) => values.reduce((a, b) => a + (Number(b) || 0), 0),
  count: (values) => values.length,
  avg: (values) => {
    const sum = values.reduce((a, b) => a + (Number(b) || 0), 0);
    return values.length ? sum / values.length : 0;
  },
  min: (values) => Math.min(...values.map((v) => Number(v) || 0)),
  max: (values) => Math.max(...values.map((v) => Number(v) || 0)),
  median: (values) => {
    const sorted = values.map((v) => Number(v) || 0).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  },
  mode: (values) => {
    const counts = new Map<number | string, number>();
    values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    let maxCount = 0;
    let mode: number | string = 0;
    counts.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        mode = value;
      }
    });
    return mode;
  },
  stddev: (values) => {
    const avg = aggregationFunctions.avg(values) as number;
    const squareDiffs = values.map((v) => {
      const diff = (Number(v) || 0) - avg;
      return diff * diff;
    });
    return Math.sqrt(aggregationFunctions.avg(squareDiffs) as number);
  },
  variance: (values) => {
    const avg = aggregationFunctions.avg(values) as number;
    const squareDiffs = values.map((v) => {
      const diff = (Number(v) || 0) - avg;
      return diff * diff;
    });
    return aggregationFunctions.avg(squareDiffs) as number;
  },
  countUnique: (values) => new Set(values).size,
  singleValue: (values) => {
    const uniqueValues = new Set(values);
    if (uniqueValues.size !== 1) {
      throw new Error("Multiple values found when single value expected");
    }
    return values[0];
  },
};

function flattenHeaders(headers: PivotHeader[]): PivotHeader[] {
  const result: PivotHeader[] = [];
  headers.forEach((header) => {
    if (!header.children?.length) {
      result.push(header);
    } else {
      result.push(...flattenHeaders(header.children));
    }
  });
  return result;
}

function generateHeaders(data: any[], field: string): PivotHeader[] {
  if (!field) {
    return [];
  }

  // Get unique values for the column field
  const uniqueValues = new Set(data.map((d) => d[field]));
  const values = Array.from(uniqueValues).sort();

  return values.map((value) => ({
    label: String(value),
    field,
    value,
    children: [],
    span: 1,
    depth: 0,
  }));
}

function generateCells(
  rowData: any[],
  columnHeaders: PivotHeader[],
  valueFields: PivotTableSettings["valueFields"]
): PivotCell[] {
  const cells: PivotCell[] = [];

  // If there are no columns defined, create a single cell for the total
  if (columnHeaders.length === 0) {
    for (const valueField of valueFields) {
      const values = rowData.map((d) => d[valueField.field]);
      const value = aggregationFunctions[valueField.aggregation](values);

      cells.push({
        key: {
          columnField: "total",
          columnValue: "total" as datum,
          valueField: valueField.field,
        },
        value,
        rawValue: value,
        sourceRows: rowData,
      });
    }
    return cells;
  }

  // Generate cells for each column header
  for (const header of columnHeaders) {
    const columnData = rowData.filter((d) => d[header.field] === header.value);

    for (const valueField of valueFields) {
      const values = columnData.map((d) => d[valueField.field]);
      const value = aggregationFunctions[valueField.aggregation](values);

      cells.push({
        key: {
          columnField: header.field,
          columnValue: header.value,
          valueField: valueField.field,
        },
        value,
        rawValue: value,
        sourceRows: columnData,
      });
    }
  }

  return cells;
}

function generateRows(
  data: any[],
  rowFields: string[],
  columnField: string,
  valueFields: PivotTableSettings["valueFields"],
  showTotals: PivotTableSettings["showTotals"]
): PivotRow[] {
  const rows: PivotRow[] = [];
  const columnHeaders = generateHeaders(data, columnField);

  // Pre-compute row groups for better performance
  const rowGroups = new Map<string, any[]>();
  data.forEach((item) => {
    // Create a composite key for grouping, but store the individual values
    const keyString = rowFields.map((field) => item[field]).join(":");
    if (!rowGroups.has(keyString)) {
      rowGroups.set(keyString, []);
    }
    rowGroups.get(keyString)!.push(item);
  });

  // Generate rows
  rowGroups.forEach((groupData, keyString) => {
    // Create properly typed keys and headers
    const keys = rowFields.map((field, index) => {
      const value = groupData[0][field];
      return {
        field,
        value,
      };
    });

    const headers = keys.map((key, index) => ({
      label: String(key.value),
      field: key.field,
      value: key.value,
      span: 1,
      depth: index,
    }));

    const cells = generateCells(groupData, columnHeaders, valueFields);

    rows.push({
      keys,
      headers,
      cells,
    });
  });

  return rows;
}

export function calculatePivotData(
  data: any[],
  settings: PivotTableSettings
): PivotTableData {
  const headers = generateHeaders(data, settings.columnField);
  const rows = generateRows(
    data,
    settings.rowFields,
    settings.columnField,
    settings.valueFields,
    settings.showTotals
  );

  return {
    headers,
    rows,
  };
}
