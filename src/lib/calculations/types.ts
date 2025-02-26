export interface Expression {
  id: string;
  type:
    | "basic"
    | "function"
    | "group"
    | "rank"
    | "advanced"
    | "derived"
    | "ternary"
    | "unary"
    | "literal";
  name: string;
  expression: string;
  dependencies: string[];
  metadata?: ExpressionMetadata;
  // For function calls
  arguments?: Expression[];
  functionName?: string;
  // For ternary expressions
  condition?: Expression;
  trueBranch?: Expression;
  falseBranch?: Expression;
}

export interface ExpressionMetadata {
  // For group calculations
  groupBy?: string[];
  aggregation?: AggregationType;

  // For rank calculations
  rankBy?: string[];
  isNormalized?: boolean;
  isCumulative?: boolean;

  // For advanced calculations
  algorithm?: "pca" | "tsne" | "umap" | "som";
  parameters?: Record<string, any>;

  // For regression
  regressionType?: "linear" | "polynomial";
  degree?: number;
  predictors?: string[];
  response?: string;

  // For function calls
  functionCategory?: string;
  returnType?: string;
  parameterTypes?: string[];
}

export type AggregationType =
  | "sum"
  | "count"
  | "min"
  | "max"
  | "average"
  | "countUnique"
  | "percentile"
  | "median"
  | "stddev"
  | "variance";

export interface CalculationResult {
  success: boolean;
  value: any;
  error?: string;
  metadata?: {
    groupKey?: string;
    rank?: number;
    total?: number;
    sourceRows?: any[];
  };
}

export interface CalculationContext {
  data: Record<string, any>[];
  variables: Record<string, any>;
  cache?: Map<string, any>;
}
