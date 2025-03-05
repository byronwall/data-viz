import { PivotTableSettings } from "@/types/ChartTypes";
import { PivotTableData, PivotHeader, PivotRow, PivotCell } from "../types";

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

function generateHeaders(data: any[], fields: string[]): PivotHeader[] {
  if (!fields.length) {
    return [];
  }

  // Pre-compute unique values for better performance
  const uniqueValues = new Map<string, Set<any>>();
  fields.forEach((field) => {
    uniqueValues.set(field, new Set(data.map((d) => d[field])));
  });

  function buildHeaderTree(depth: number): PivotHeader[] {
    if (depth >= fields.length) {
      return [];
    }

    const field = fields[depth];
    const values = Array.from(uniqueValues.get(field) || []).sort();
    return values.map((value) => {
      const children = buildHeaderTree(depth + 1);
      const span = children.length || 1;
      return {
        label: String(value),
        field,
        value,
        children,
        span,
        depth,
      };
    });
  }

  return buildHeaderTree(0);
}

function generateCells(
  rowData: any[],
  columnHeaders: PivotHeader[],
  valueFields: PivotTableSettings["valueFields"]
): PivotCell[] {
  const flatColumns = flattenHeaders(columnHeaders);
  const cells: PivotCell[] = [];

  // If there are no columns defined, create a single cell for the total
  if (flatColumns.length === 0) {
    for (const valueField of valueFields) {
      const values = rowData.map((d) => d[valueField.field]);
      const value = aggregationFunctions[valueField.aggregation](values);

      cells.push({
        key: `total-${valueField.field}`,
        value,
        rawValue: value,
        sourceRows: rowData,
      });
    }
    return cells;
  }

  // Rest of the original function for when columns are defined
  // Pre-compute column data filters for better performance
  const columnFilters = flatColumns.map((column) => {
    let current: PivotHeader | undefined = column;
    const filters: Array<{ field: string; value: any }> = [];
    while (current) {
      filters.push({ field: current.field, value: current.value });
      current = current.children?.[0];
    }
    return filters;
  });

  for (let colIndex = 0; colIndex < flatColumns.length; colIndex++) {
    const column = flatColumns[colIndex];
    const filters = columnFilters[colIndex];

    const columnData = rowData.filter((d) =>
      filters.every((f) => d[f.field] === f.value)
    );

    for (const valueField of valueFields) {
      const values = columnData.map((d) => d[valueField.field]);
      const value = aggregationFunctions[valueField.aggregation](values);

      cells.push({
        key: `${column.field}-${column.value}-${valueField.field}`,
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
  columnFields: string[],
  valueFields: PivotTableSettings["valueFields"],
  showTotals: PivotTableSettings["showTotals"]
): PivotRow[] {
  const rows: PivotRow[] = [];
  const columnHeaders = generateHeaders(data, columnFields);

  // Pre-compute row groups for better performance
  const rowGroups = new Map<string, any[]>();
  data.forEach((item) => {
    const key = rowFields.map((field) => item[field]).join(":");
    if (!rowGroups.has(key)) {
      rowGroups.set(key, []);
    }
    rowGroups.get(key)!.push(item);
  });

  // Generate rows
  rowGroups.forEach((groupData, key) => {
    const headers = key.split(":").map((value, index) => ({
      label: String(value),
      field: rowFields[index],
      value,
      span: 1,
      depth: index,
    }));

    const cells = generateCells(groupData, columnHeaders, valueFields);

    rows.push({
      key,
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
  const headers = generateHeaders(data, settings.columnFields);
  const rows = generateRows(
    data,
    settings.rowFields,
    settings.columnFields,
    settings.valueFields,
    settings.showTotals
  );

  return {
    headers,
    rows,
  };
}
