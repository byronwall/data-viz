import { parseExpression } from "../parser/semantics";
import {
  type AdvancedExpression,
  type BasicExpression,
  type CalculationContext,
  type CalculationResult,
  type Expression,
  type FunctionExpression,
  type GroupExpression,
  type LiteralExpression,
  type RankExpression,
  type TernaryExpression,
  type UnaryExpression,
} from "../types";

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
        case "literal":
          result = await this.evaluateExpression(expression);
          break;
        case "ternary":
          result = await this.evaluateExpression(expression);
          break;
        case "unary":
          result = await this.evaluateExpression(expression);
          break;
        default:
          throw new Error(
            `Unknown expression type: ${(expression as any).type}`
          );
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

  private async evaluateBasic(expression: BasicExpression): Promise<any> {
    // For basic expressions, directly evaluate using the evaluator
    return this.evaluateExpression(expression);
  }

  private async evaluateFunction(expression: FunctionExpression): Promise<any> {
    // Evaluate all arguments first
    const evaluatedArgs = await Promise.all(
      expression.arguments.map(async (arg: Expression) => {
        // For each argument, first parse it if it's a string expression
        const parsedArg =
          typeof arg.expression === "string"
            ? parseExpression(arg.expression)
            : arg;

        // Then evaluate it
        return this.evaluateExpression(parsedArg);
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

  private async evaluateGroup(expression: GroupExpression): Promise<any> {
    const groupBy = expression.groupBy;
    const aggregation = expression.aggregation;

    // Group the data
    const groups = new Map<string, any[]>();
    for (const row of this.context.data) {
      const key = groupBy.map((field: string) => row[field]).join(":");
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

  private async evaluateRank(expression: RankExpression): Promise<any> {
    const rankBy = expression.rankBy;
    const isNormalized = expression.isNormalized;
    const isCumulative = expression.isCumulative;

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

  private async evaluateAdvanced(expression: AdvancedExpression): Promise<any> {
    // This would be implemented based on the specific advanced analytics needed
    throw new Error("Advanced analytics not implemented yet");
  }

  private async evaluateDerived(expression: Expression): Promise<any> {
    // Evaluate the base expression
    return this.evaluateBasic(expression as BasicExpression);
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

  private evaluateExpression(expr: Expression): number {
    if (expr.type === "literal") {
      const literalExpr = expr as LiteralExpression;
      if (literalExpr.value !== undefined) {
        // If it's a string and looks like an identifier, throw an error
        if (
          typeof literalExpr.value === "string" &&
          /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(literalExpr.value)
        ) {
          throw new Error(`Cannot evaluate identifier: ${literalExpr.value}`);
        }
        return Number(literalExpr.value);
      }
      return Number(literalExpr.name);
    }

    if (expr.type === "basic") {
      const basicExpr = expr as BasicExpression;
      if (!basicExpr.left || !basicExpr.right) {
        throw new Error(`Invalid basic expression: missing operands`);
      }

      const left = this.evaluateExpression(basicExpr.left);
      const right = this.evaluateExpression(basicExpr.right);

      switch (basicExpr.operator) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          if (right === 0) {
            throw new Error("Division by zero");
          }
          return left / right;
        case "^":
          return Math.pow(left, right);
        default:
          throw new Error(`Unknown operator: ${basicExpr.operator}`);
      }
    }

    if (expr.type === "unary") {
      const unaryExpr = expr as UnaryExpression;
      if (!unaryExpr.operand) {
        throw new Error(`Invalid unary expression: missing operand`);
      }

      const operand = this.evaluateExpression(unaryExpr.operand);

      switch (unaryExpr.operator) {
        case "-":
          return -operand;
        case "+":
          return operand;
        default:
          throw new Error(`Unknown unary operator: ${unaryExpr.operator}`);
      }
    }

    if (expr.type === "ternary") {
      const ternaryExpr = expr as TernaryExpression;
      if (
        !ternaryExpr.condition ||
        !ternaryExpr.trueBranch ||
        !ternaryExpr.falseBranch
      ) {
        throw new Error(`Invalid ternary expression: missing branches`);
      }

      const condition = this.evaluateExpression(ternaryExpr.condition);
      return condition
        ? this.evaluateExpression(ternaryExpr.trueBranch)
        : this.evaluateExpression(ternaryExpr.falseBranch);
    }

    throw new Error(`Unsupported expression type: ${expr.type}`);
  }
}
