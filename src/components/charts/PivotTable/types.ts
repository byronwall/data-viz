import { datum } from "@/types/FilterTypes";

export interface PivotHeader {
  label: string;
  field: string;
  value: string | number;
  children?: PivotHeader[];
  span: number;
  depth: number;
}

export interface CellKey {
  columnField: string;
  columnValue: datum;
  valueField?: string;
}

export interface PivotCell {
  key: CellKey;
  value: number | string | null;
  rawValue?: any;
  sourceRows?: any[];
}

export interface PivotRow {
  key: string;
  headers: PivotHeader[];
  cells: PivotCell[];
  subtotal?: boolean;
}

export interface PivotTableData {
  headers: PivotHeader[];
  rows: PivotRow[];
  totals?: {
    row: Record<string, number | string>;
    column: Record<string, number | string>;
    grand: Record<string, number | string>;
  };
}

export interface FilterState {
  field: string;
  values: Set<string | number>;
}
