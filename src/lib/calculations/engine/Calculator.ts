import {
  type Expression,
  type CalculationResult,
  type CalculationContext,
} from "../types";
import { parseExpression } from "../parser/semantics";
import { evaluate } from "../evaluator";

type CalcFunction = (...args: any[]) => any;

export class Calculator {
  private cache: Map<string, any>;

  constructor(private context: CalculationContext) {
    this.cache = context.cache || new Map();
  }

  async evaluate(expression: Expression): Promise<CalculationResult> {
    try {
      // Check cache first
      if (this.cache.has(expression.id)) {
        return {
          success: true,
          value: this.cache.get(expression.id),
        };
      }

      let result: any;

      switch (expression.type) {
        case "basic":
          result = await this.evaluateBasic(expression);
          break;
        case "function":
          result = await this.evaluateFunction(expression);
          break;
        case "group":
          result = await this.evaluateGroup(expression);
          break;
        case "rank":
          result = await this.evaluateRank(expression);
          break;
        case "advanced":
          result = await this.evaluateAdvanced(expression);
          break;
        case "derived":
          result = await this.evaluateDerived(expression);
          break;
        default:
          throw new Error(`Unknown expression type: ${expression.type}`);
      }

      // Cache the result
      this.cache.set(expression.id, result);

      return {
        success: true,
        value: result,
      };
    } catch (error) {
      return {
        success: false,
        value: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async evaluateBasic(expression: Expression): Promise<any> {
    // For basic expressions, directly evaluate using the evaluator
    return evaluate(expression);
  }

  private async evaluateFunction(expression: Expression): Promise<any> {
    if (!expression.functionName) {
      throw new Error("Function name is required");
    }

    // Evaluate all arguments first
    const evaluatedArgs = await Promise.all(
      (expression.arguments || []).map(async (arg) => {
        // For each argument, first parse it if it's a string expression
        const parsedArg =
          typeof arg.expression === "string"
            ? parseExpression(arg.expression)
            : arg;

        // Then evaluate it
        return evaluate(parsedArg);
      })
    );

    // Get the function implementation
    const func = this.getFunction(expression.functionName);
    if (!func) {
      throw new Error(`Unknown function: ${expression.functionName}`);
    }

    // Execute the function with evaluated arguments
    return func(evaluatedArgs);
  }

  private async evaluateGroup(expression: Expression): Promise<any> {
    if (!expression.metadata?.groupBy) {
      throw new Error("Group by fields are required");
    }

    const groupBy = expression.metadata.groupBy;
    const aggregation = expression.metadata.aggregation || "sum";

    // Group the data
    const groups = new Map<string, any[]>();
    for (const row of this.context.data) {
      const key = groupBy.map((field) => row[field]).join(":");
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    }

    // Apply aggregation to each group
    const results = new Map<string, any>();
    for (const [key, groupData] of groups) {
      results.set(key, this.aggregate(groupData, aggregation));
    }

    return Object.fromEntries(results);
  }

  private async evaluateRank(expression: Expression): Promise<any> {
    if (!expression.metadata?.rankBy) {
      throw new Error("Rank by fields are required");
    }

    const rankBy = expression.metadata.rankBy;
    const isNormalized = expression.metadata.isNormalized || false;
    const isCumulative = expression.metadata.isCumulative || false;

    // Sort the data
    const sortedData = [...this.context.data].sort((a, b) => {
      for (const field of rankBy) {
        if (a[field] < b[field]) {
          return -1;
        }
        if (a[field] > b[field]) {
          return 1;
        }
      }
      return 0;
    });

    // Assign ranks
    const ranks = new Map<any, number>();
    sortedData.forEach((row, index) => {
      const rank = index + 1;
      ranks.set(row, isNormalized ? rank / sortedData.length : rank);
    });

    if (isCumulative) {
      let sum = 0;
      for (const [key, value] of ranks) {
        sum += value;
        ranks.set(key, sum);
      }
    }

    return Object.fromEntries(ranks);
  }

  private async evaluateAdvanced(expression: Expression): Promise<any> {
    if (!expression.metadata?.algorithm) {
      throw new Error("Algorithm type is required");
    }

    // This would be implemented based on the specific advanced analytics needed
    throw new Error("Advanced analytics not implemented yet");
  }

  private async evaluateDerived(expression: Expression): Promise<any> {
    // Evaluate the base expression
    return this.evaluateBasic(expression);
  }

  private getFunction(name: string): CalcFunction | undefined {
    const functions: Record<string, CalcFunction> = {
      sum: (values: number[]) => values.reduce((a, b) => a + b, 0),
      avg: (values: number[]) =>
        values.reduce((a, b) => a + b, 0) / values.length,
      min: (values: number[]) => Math.min(...values),
      max: (values: number[]) => Math.max(...values),
      count: (values: any[]) => values.length,
    };

    return functions[name.toLowerCase()];
  }

  private aggregate(data: any[], type: string): any {
    const values = data.map((row) => row.value);

    switch (type) {
      case "sum":
        return values.reduce((a, b) => a + b, 0);
      case "average":
        return values.reduce((a, b) => a + b, 0) / values.length;
      case "min":
        return Math.min(...values);
      case "max":
        return Math.max(...values);
      case "count":
        return values.length;
      case "countUnique":
        return new Set(values).size;
      default:
        throw new Error(`Unknown aggregation type: ${type}`);
    }
  }

  private async evaluateNode(node: Expression): Promise<any> {
    return evaluate(node);
  }
}
