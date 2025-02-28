import { timeFormat } from "d3-time-format";
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
import { datum } from "@/types/ChartTypes";
import { Data } from "@dnd-kit/core";

type CalcFunction = (...args: any[]) => any;

export class Calculator {
  constructor(private context: CalculationContext) {}

  evaluate(expression: Expression): CalculationResult {
    try {
      console.log(
        `[Calculator.evaluate] Starting evaluation of expression type: ${expression.type}`
      );

      let result: any;
      let funcResult: CalculationResult;

      switch (expression.type) {
        case "basic":
          result = this.evaluateBasic(expression as BasicExpression);
          break;
        case "function":
          funcResult = this.evaluateFunction(expression as FunctionExpression);
          if (!funcResult.success) {
            console.error(
              `[Calculator.evaluate] Function evaluation failed: ${funcResult.error}`
            );
            return funcResult;
          }
          result = funcResult.value;
          break;
        case "group":
          result = this.evaluateGroup(expression as GroupExpression);
          break;
        case "rank":
          result = this.evaluateRank(expression as RankExpression);
          break;
        case "advanced":
          result = this.evaluateAdvanced(expression as AdvancedExpression);
          break;
        case "ternary":
          result = this.evaluateTernary(expression as TernaryExpression);
          break;
        case "unary":
          result = this.evaluateUnary(expression as UnaryExpression);
          break;
        case "literal":
          result = this.evaluateLiteral(expression as LiteralExpression);
          break;
        default:
          throw new Error(
            `Unknown expression type: ${(expression as any).type}`
          );
      }

      // Ensure we return a proper CalculationResult
      return {
        success: true,
        value: result,
      };
    } catch (error: unknown) {
      console.error(
        `[Calculator.evaluate] Error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return {
        success: false,
        value: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private evaluateBasic(expression: BasicExpression): datum {
    if (!expression.left || !expression.right) {
      throw new Error(`Invalid basic expression: missing operands`);
    }

    const leftResult = this.evaluate(expression.left);
    if (!leftResult.success) {
      throw new Error(`Failed to evaluate left operand: ${leftResult.error}`);
    }

    const rightResult = this.evaluate(expression.right);
    if (!rightResult.success) {
      throw new Error(`Failed to evaluate right operand: ${rightResult.error}`);
    }

    const left = leftResult.value;
    const right = rightResult.value;

    // Convert operands to numbers if they're strings that look like numbers
    const leftNum = typeof left === "string" ? Number(left) : left;
    const rightNum = typeof right === "string" ? Number(right) : right;

    if (isNaN(leftNum) || isNaN(rightNum)) {
      throw new Error(
        `Invalid operands for operator ${expression.operator}: ${left}, ${right}`
      );
    }

    switch (expression.operator) {
      case "+":
        return leftNum + rightNum;
      case "-":
        return leftNum - rightNum;
      case "*":
        return leftNum * rightNum;
      case "/":
        if (rightNum === 0) {
          throw new Error("Division by zero");
        }
        return leftNum / rightNum;
      case "^":
        return Math.pow(leftNum, rightNum);
      default:
        throw new Error(`Unknown operator: ${expression.operator}`);
    }
  }

  private evaluateFunction(expression: FunctionExpression): CalculationResult {
    console.log(
      `[Calculator.evaluateFunction] Evaluating function: ${expression.functionName}`
    );
    // Get the function implementation first
    const func = this.getFunction(expression.functionName);
    if (!func) {
      console.error(
        `[Calculator.evaluateFunction] Unknown function: ${expression.functionName}`
      );
      return {
        success: false,
        value: null,
        error: `Unknown function: ${expression.functionName}`,
      };
    }

    try {
      // Evaluate all arguments
      console.log(
        `[Calculator.evaluateFunction] Evaluating ${expression.arguments.length} arguments`
      );
      const evaluatedArgs = expression.arguments.map((arg: Expression) => {
        if (arg.type === "literal") {
          const literalArg = arg as LiteralExpression;
          console.log(
            `[Calculator.evaluateFunction] Processing literal argument:`,
            literalArg
          );

          // If it has a numeric value, use it directly
          if (literalArg.value !== undefined) {
            if (typeof literalArg.value === "number") {
              return literalArg.value;
            }

            // If it's a string literal, use it directly
            if (typeof literalArg.value === "string") {
              // Check if it's a variable reference
              if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(literalArg.value)) {
                const value = this.context.variables.get(literalArg.value);
                if (value !== undefined) {
                  return value;
                }
              }
              return literalArg.value;
            }

            return literalArg.value;
          }

          // If name is defined and it's a number, use it directly
          if (typeof literalArg.name === "string") {
            // If it looks like a number, convert it
            if (!isNaN(Number(literalArg.name))) {
              return Number(literalArg.name);
            }

            // If it looks like a variable, try to resolve it
            if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(literalArg.name)) {
              const value = this.context.variables.get(literalArg.name);
              if (value !== undefined) {
                return value;
              }
            }

            return literalArg.name;
          }

          return literalArg.value !== undefined
            ? literalArg.value
            : literalArg.name;
        }

        const result = this.evaluate(arg);
        if (!result.success) {
          throw new Error(`Failed to evaluate argument: ${result.error}`);
        }
        return result.value;
      });

      console.log(
        `[Calculator.evaluateFunction] Arguments evaluated:`,
        evaluatedArgs
      );

      // For date functions, ensure the first argument is a Date object
      if (
        expression.functionName.toLowerCase() === "formatdate" ||
        expression.functionName.toLowerCase() === "extractdatecomponent"
      ) {
        if (!(evaluatedArgs[0] instanceof Date)) {
          try {
            console.log(
              `[Calculator.evaluateFunction] Converting to Date:`,
              evaluatedArgs[0]
            );

            // If it's a variable name, try to get the actual date from variables
            if (
              typeof evaluatedArgs[0] === "string" &&
              /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(evaluatedArgs[0])
            ) {
              const dateValue = this.context.variables.get(evaluatedArgs[0]);
              if (dateValue instanceof Date) {
                evaluatedArgs[0] = dateValue;
                console.log(
                  `[Calculator.evaluateFunction] Found date in variables:`,
                  evaluatedArgs[0]
                );
              } else if (dateValue !== undefined) {
                evaluatedArgs[0] = new Date(dateValue);
                console.log(
                  `[Calculator.evaluateFunction] Converted variable to date:`,
                  evaluatedArgs[0]
                );
              }
            } else {
              evaluatedArgs[0] = new Date(evaluatedArgs[0]);
            }

            if (isNaN(evaluatedArgs[0].getTime())) {
              console.error(
                `[Calculator.evaluateFunction] Invalid date:`,
                evaluatedArgs[0]
              );
              return {
                success: false,
                value: null,
                error: `Invalid date: ${evaluatedArgs[0]}`,
              };
            }
          } catch (error) {
            console.error(
              `[Calculator.evaluateFunction] Date conversion error:`,
              error
            );
            return {
              success: false,
              value: null,
              error: `Failed to convert argument to Date: ${
                error instanceof Error ? error.message : String(error)
              }`,
            };
          }
        }
      }

      // Execute the function with evaluated arguments
      const result = func(...evaluatedArgs);
      console.log(`[Calculator.evaluateFunction] Function result:`, result);
      return {
        success: true,
        value: result,
      };
    } catch (error) {
      console.error(`[Calculator.evaluateFunction] Error:`, error);
      return {
        success: false,
        value: null,
        error: `Error executing function ${expression.functionName}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  private evaluateGroup(expression: GroupExpression): Record<string, datum> {
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

  private evaluateRank(expression: RankExpression): Record<number, number> {
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
    const ranks = new Map<number, number>();
    sortedData.forEach((row, index) => {
      const rank = index + 1;
      ranks.set(row.id, isNormalized ? rank / sortedData.length : rank);
    });

    if (isCumulative) {
      let sum = 0;
      const sortedRanks = Array.from(ranks.entries()).sort(([id1], [id2]) => {
        const row1 = sortedData.find((row) => row.id === id1);
        const row2 = sortedData.find((row) => row.id === id2);
        if (!row1 || !row2) {
          return 0;
        }
        for (const field of rankBy) {
          if (row1[field] < row2[field]) {
            return -1;
          }
          if (row1[field] > row2[field]) {
            return 1;
          }
        }
        return 0;
      });

      for (const [id, value] of sortedRanks) {
        sum += value;
        ranks.set(id, sum);
      }
    }

    return Object.fromEntries(ranks);
  }

  private evaluateAdvanced(expression: AdvancedExpression): Promise<any> {
    // This would be implemented based on the specific advanced analytics needed
    throw new Error("Advanced analytics not implemented yet");
  }

  private getFunction(name: string): CalcFunction | undefined {
    console.log(`[Calculator.getFunction] Looking up function: ${name}`);
    const functions: Record<string, CalcFunction> = {
      sum: (...values: number[]) => {
        console.log(`[Calculator.sum] Calculating sum of:`, values);
        return values.reduce((a, b) => Number(a) + Number(b), 0);
      },
      avg: (...values: number[]) => {
        console.log(`[Calculator.avg] Calculating average of:`, values);
        return (
          values.reduce((a, b) => Number(a) + Number(b), 0) / values.length
        );
      },
      min: (...values: number[]) => {
        console.log(`[Calculator.min] Calculating min of:`, values);
        return Math.min(...values.map((v) => Number(v)));
      },
      max: (...values: number[]) => {
        console.log(`[Calculator.max] Calculating max of:`, values);
        return Math.max(...values.map((v) => Number(v)));
      },
      count: (...values: any[]) => {
        console.log(`[Calculator.count] Counting values:`, values);
        return values.length;
      },
      formatdate: (date: Date, format: string) => {
        console.log(`[Calculator.formatdate] Formatting date:`, date, format);
        return this.formatDate(date, format);
      },
      extractdatecomponent: (
        date: Date,
        component: "year" | "month" | "day" | "quarter" | "week"
      ) => {
        console.log(
          `[Calculator.extractdatecomponent] Extracting ${component} from:`,
          date
        );
        return this.extractDateComponent(date, component);
      },
    };

    // First try exact match
    if (name in functions) {
      return functions[name];
    }

    // Try case-insensitive match
    const lowerName = name.toLowerCase();
    const functionKey = Object.keys(functions).find(
      (key) => key.toLowerCase() === lowerName
    );
    return functionKey ? functions[functionKey] : undefined;
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
        // If it's a string and looks like an identifier, try to resolve it from variables
        if (
          typeof literalExpr.value === "string" &&
          /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(literalExpr.value)
        ) {
          const value = this.context.variables.get(literalExpr.value);
          if (value === undefined) {
            throw new Error(`Undefined variable: ${literalExpr.value}`);
          }
          return Number(value);
        }
        return Number(literalExpr.value);
      }
      // Handle identifiers in the name field
      if (
        typeof literalExpr.name === "string" &&
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(literalExpr.name)
      ) {
        const value = this.context.variables.get(literalExpr.name);
        if (value === undefined) {
          throw new Error(`Undefined variable: ${literalExpr.name}`);
        }
        return Number(value);
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

  private evaluateUnary(expression: UnaryExpression): datum {
    if (!expression.operand) {
      throw new Error(`Invalid unary expression: missing operand`);
    }
    return this.evaluateExpression(expression);
  }

  private evaluateTernary(expression: TernaryExpression): datum {
    if (
      !expression.condition ||
      !expression.trueBranch ||
      !expression.falseBranch
    ) {
      throw new Error(`Invalid ternary expression: missing branches`);
    }
    return this.evaluateExpression(expression);
  }

  // Date Processing Functions
  private formatDate(date: Date, format: string): string {
    console.log(
      `[Calculator.formatDate] Formatting date with format: ${format}`,
      date
    );
    try {
      const formatter = timeFormat(format);
      const result = formatter(date);
      console.log(`[Calculator.formatDate] Result:`, result);
      return result;
    } catch (error) {
      console.error(`[Calculator.formatDate] Error:`, error);
      throw new Error(
        `Error formatting date: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private getISOWeek(date: Date): number {
    try {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
      const week1 = new Date(d.getFullYear(), 0, 4);
      return (
        1 +
        Math.round(
          ((d.getTime() - week1.getTime()) / 86400000 -
            3 +
            ((week1.getDay() + 6) % 7)) /
            7
        )
      );
    } catch (error) {
      throw new Error(
        `Error calculating ISO week: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private extractDateComponent(
    date: Date,
    component: "year" | "month" | "day" | "quarter" | "week"
  ): number {
    try {
      console.log(
        `[Calculator.extractDateComponent] Processing date:`,
        date,
        `for component:`,
        component
      );
      let result: number;
      switch (component) {
        case "year":
          result = date.getFullYear();
          break;
        case "month":
          result = date.getMonth() + 1; // Adding 1 since getMonth() returns 0-11
          break;
        case "day":
          result = date.getDate();
          break;
        case "quarter":
          result = Math.floor(date.getMonth() / 3) + 1;
          break;
        case "week":
          result = this.getISOWeek(date);
          break;
        default:
          throw new Error(`Unknown date component: ${component}`);
      }
      console.log(`[Calculator.extractDateComponent] Result:`, result);
      return result;
    } catch (error) {
      console.error(`[Calculator.extractDateComponent] Error:`, error);
      throw new Error(
        `Error extracting date component: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // String Operation Functions
  private concatenateStrings(strings: string[]): string {
    throw new Error("String concatenation not implemented");
  }

  private extractSubstring(str: string, start: number, end?: number): string {
    throw new Error("Substring extraction not implemented");
  }

  private patternMatch(
    str: string,
    pattern: string,
    replacement?: string
  ): string | string[] {
    throw new Error("Pattern matching not implemented");
  }

  // Statistical Functions
  private calculatePercentile(values: number[], percentile: number): number {
    throw new Error("Percentile calculation not implemented");
  }

  private calculateStandardDeviation(values: number[]): number {
    throw new Error("Standard deviation calculation not implemented");
  }

  private calculateVariance(values: number[]): number {
    throw new Error("Variance calculation not implemented");
  }

  private calculateMedian(values: number[]): number {
    throw new Error("Median calculation not implemented");
  }

  private calculateZScore(value: number, mean: number, stdDev: number): number {
    throw new Error("Z-score calculation not implemented");
  }

  // Advanced Analytics Functions
  private performSOM(
    data: number[][],
    options: Record<string, any>
  ): number[][] {
    throw new Error("Self-organizing maps not implemented");
  }

  private performPCA(data: number[][], components: number): number[][] {
    throw new Error("PCA not implemented");
  }

  private performUMAP(
    data: number[][],
    options: Record<string, any>
  ): number[][] {
    throw new Error("UMAP transformation not implemented");
  }

  private performTSNE(
    data: number[][],
    options: Record<string, any>
  ): number[][] {
    throw new Error("t-SNE transformation not implemented");
  }

  // Regression Analysis Functions
  private performLinearRegression(
    x: number[],
    y: number[]
  ): Record<string, any> {
    throw new Error("Linear regression not implemented");
  }

  private performPolynomialRegression(
    x: number[],
    y: number[],
    degree: number
  ): Record<string, any> {
    throw new Error("Polynomial regression not implemented");
  }

  private calculateResiduals(
    observed: number[],
    predicted: number[]
  ): number[] {
    throw new Error("Residuals calculation not implemented");
  }

  private performANOVA(groups: number[][]): Record<string, any> {
    throw new Error("ANOVA not implemented");
  }

  // Data Transformation Functions
  private normalizeData(values: number[]): number[] {
    throw new Error("Data normalization not implemented");
  }

  private standardizeData(values: number[]): number[] {
    throw new Error("Data standardization not implemented");
  }

  private logTransform(values: number[], base?: number): number[] {
    throw new Error("Logarithmic transformation not implemented");
  }

  private binData(
    values: number[],
    binCount: number
  ): Record<string, number[]> {
    throw new Error("Data binning not implemented");
  }

  private createDummyVariables(categories: string[]): Record<string, number[]> {
    throw new Error("Dummy variable creation not implemented");
  }

  private evaluateLiteral(expression: LiteralExpression): any {
    // If value is defined, use it first
    if (expression.value !== undefined) {
      // If it's a string that looks like an identifier, try to resolve it from variables
      if (
        typeof expression.value === "string" &&
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression.value)
      ) {
        const value = this.context.variables.get(expression.value);
        if (value === undefined) {
          throw new Error(`Undefined variable: ${expression.value}`);
        }
        return value;
      }
      // If it's a string that looks like a number, convert it
      if (
        typeof expression.value === "string" &&
        !isNaN(Number(expression.value))
      ) {
        return Number(expression.value);
      }
      return expression.value;
    }

    // If name is defined and looks like an identifier, try to resolve it from variables
    if (
      typeof expression.name === "string" &&
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression.name)
    ) {
      const value = this.context.variables.get(expression.name);
      if (value === undefined) {
        throw new Error(`Undefined variable: ${expression.name}`);
      }
      return value;
    }

    // If name is a string that looks like a number, convert it
    if (
      typeof expression.name === "string" &&
      !isNaN(Number(expression.name))
    ) {
      return Number(expression.name);
    }

    return expression.name;
  }
}
