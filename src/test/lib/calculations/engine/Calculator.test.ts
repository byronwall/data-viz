import { describe, expect, it } from "vitest";
import { Calculator } from "../../../../lib/calculations/engine/Calculator";
import { parseExpression } from "../../../../lib/calculations/parser/semantics";
import {
  AdvancedExpression,
  AggregationType,
  BasicExpression,
  GroupExpression,
  RankExpression,
  TernaryExpression,
  UnaryExpression,
} from "../../../../lib/calculations/types";

describe("Calculator", () => {
  describe("Expression Structure", () => {
    const calculator = new Calculator({
      data: [],
      variables: new Map(),
    });

    it("should inspect parsed expression structure", async () => {
      const expr = parseExpression("2 + 3");
      console.log(JSON.stringify(expr, null, 2));
    });
  });

  describe("Basic Expression Evaluation", () => {
    const calculator = new Calculator({
      data: [],
      variables: new Map(),
    });

    it("should evaluate simple addition", async () => {
      const expr = parseExpression("2 + 3");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(5);
    });

    it("should evaluate simple multiplication", async () => {
      const expr = parseExpression("4 * 5");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(20);
    });

    it("should evaluate simple division", async () => {
      const expr = parseExpression("10 / 2");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(5);
    });

    it("should evaluate simple subtraction", async () => {
      const expr = parseExpression("7 - 3");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(4);
    });

    it("should evaluate exponentiation", async () => {
      const expr = parseExpression("2 ^ 3");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(8);
    });

    it("should handle division by zero", async () => {
      const expr = parseExpression("5 / 0");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Division by zero");
    });

    it("should handle invalid expressions", async () => {
      const expr = parseExpression("abc");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should evaluate expressions with multiple operators", async () => {
      const expr = parseExpression("2 + 3 * 4");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(14);
    });

    it("should respect parentheses", async () => {
      const expr = parseExpression("(2 + 3) * 4");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(20);
    });
  });

  describe("Identifier Evaluation", () => {
    it("should evaluate expressions with identifiers", async () => {
      const variables = new Map([
        ["x", 10],
        ["y", 5],
      ]);

      const calculator = new Calculator({
        data: [],
        variables,
      });

      const expr = parseExpression("x + y");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(15);
    });

    it("should evaluate complex expressions with identifiers", async () => {
      const variables = new Map([
        ["price", 100],
        ["quantity", 5],
        ["taxRate", 0.2],
      ]);

      const calculator = new Calculator({
        data: [],
        variables,
      });

      const expr = parseExpression("price * quantity * (1 + taxRate)");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(600);
    });

    it("should handle undefined identifiers", async () => {
      const calculator = new Calculator({
        data: [],
        variables: new Map(),
      });

      const expr = parseExpression("undefinedVar + 5");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Undefined variable");
    });

    it("should evaluate expressions mixing identifiers and literals", async () => {
      const variables = new Map([
        ["base", 100],
        ["multiplier", 1.5],
      ]);

      const calculator = new Calculator({
        data: [],
        variables,
      });

      const expr = parseExpression("base * multiplier + 50");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(200);
    });
  });

  describe("Function Evaluation", () => {
    const calculator = new Calculator({
      data: [],
      variables: new Map(),
    });

    it("should evaluate sum function", async () => {
      const expr = parseExpression("sum(1, 2, 3)");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(6);
    });

    it("should handle unknown functions", async () => {
      const expr = parseExpression("unknown(1, 2)");
      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown function");
    });
  });

  describe("Group Expression Evaluation", () => {
    const calculator = new Calculator({
      data: [
        { id: 1, category: "A", value: 10 },
        { id: 2, category: "A", value: 20 },
        { id: 3, category: "B", value: 30 },
        { id: 4, category: "B", value: 40 },
      ],
      variables: new Map(),
    });

    it("should evaluate group expressions with sum aggregation", async () => {
      const expr: GroupExpression = {
        id: "test-group",
        type: "group",
        name: "Group Test",
        dependencies: [],
        groupBy: ["category"],
        aggregation: "sum" as AggregationType,
        expression: "group by category",
      };

      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toEqual({
        A: 30,
        B: 70,
      });
    });

    it("should evaluate group expressions with average aggregation", async () => {
      const expr: GroupExpression = {
        id: "test-group-avg",
        type: "group",
        name: "Group Average Test",
        dependencies: [],
        groupBy: ["category"],
        aggregation: "average" as AggregationType,
        expression: "group by category",
      };

      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toEqual({
        A: 15,
        B: 35,
      });
    });
  });

  describe("Rank Expression Evaluation", () => {
    const testData = [
      { id: 1, value: 30 },
      { id: 2, value: 10 },
      { id: 3, value: 20 },
    ];

    const calculator = new Calculator({
      data: testData,
      variables: new Map(),
    });

    it("should evaluate rank expressions", async () => {
      const expr: RankExpression = {
        id: "test-rank",
        type: "rank",
        name: "Rank Test",
        dependencies: [],
        rankBy: ["value"],
        isNormalized: false,
        isCumulative: false,
        expression: "rank by value",
      };

      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      const ranks = result.value as Record<number, number>;
      expect(ranks[1]).toBe(3); // value 30
      expect(ranks[2]).toBe(1); // value 10
      expect(ranks[3]).toBe(2); // value 20
    });

    it("should evaluate normalized rank expressions", async () => {
      const expr: RankExpression = {
        id: "test-rank-norm",
        type: "rank",
        name: "Normalized Rank Test",
        dependencies: [],
        rankBy: ["value"],
        isNormalized: true,
        isCumulative: false,
        expression: "rank by value normalized",
      };

      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      const ranks = result.value as Record<number, number>;
      expect(ranks[1]).toBe(1); // value 30
      expect(ranks[2]).toBeCloseTo(0.333, 2); // value 10
      expect(ranks[3]).toBeCloseTo(0.667, 2); // value 20
    });

    it("should evaluate cumulative rank expressions", async () => {
      const expr: RankExpression = {
        id: "test-rank-cum",
        type: "rank",
        name: "Cumulative Rank Test",
        dependencies: [],
        rankBy: ["value"],
        isNormalized: false,
        isCumulative: true,
        expression: "rank by value cumulative",
      };

      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(true);
      const ranks = result.value as Record<number, number>;
      expect(ranks[1]).toBe(6); // 1 + 2 + 3
      expect(ranks[2]).toBe(1); // 1
      expect(ranks[3]).toBe(3); // 1 + 2
    });
  });

  describe("Error Handling", () => {
    const calculator = new Calculator({
      data: [],
      variables: new Map(),
    });

    it("should handle unknown expression types", async () => {
      const expr = {
        id: "test-unknown",
        type: "unknown" as const,
        name: "Unknown Test",
        dependencies: [],
        expression: "invalid",
      };

      const result = await calculator.evaluate(expr as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown expression type");
    });

    it("should handle invalid basic expressions", async () => {
      const expr: BasicExpression = {
        id: "test-invalid-basic",
        type: "basic",
        name: "Invalid Basic Test",
        dependencies: [],
        operator: "+",
        expression: "invalid",
        left: null as any,
        right: null as any,
      };

      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid basic expression");
    });

    it("should handle invalid unary expressions", async () => {
      const expr: UnaryExpression = {
        id: "test-invalid-unary",
        type: "unary",
        name: "Invalid Unary Test",
        dependencies: [],
        operator: "-",
        expression: "invalid",
        operand: null as any,
      };

      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid unary expression");
    });

    it("should handle invalid ternary expressions", async () => {
      const expr: TernaryExpression = {
        id: "test-invalid-ternary",
        type: "ternary",
        name: "Invalid Ternary Test",
        dependencies: [],
        expression: "invalid",
        condition: null as any,
        trueBranch: null as any,
        falseBranch: null as any,
      };

      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid ternary expression");
    });
  });

  describe("Advanced Expression Types", () => {
    const calculator = new Calculator({
      data: [],
      variables: new Map(),
    });

    it("should handle advanced expressions", async () => {
      const expr: AdvancedExpression = {
        id: "test-advanced",
        type: "advanced",
        name: "Advanced Test",
        dependencies: [],
        expression: "advanced analytics",
        algorithm: "pca",
      };

      const result = await calculator.evaluate(expr);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Advanced analytics not implemented yet");
    });
  });

  describe("Missing Functionality Tests (TODO)", () => {
    // These tests are placeholders for functionality that needs to be implemented
    describe("Date Processing", () => {
      const calculator = new Calculator({
        data: [],
        variables: new Map([["testDate", new Date("2024-03-15T12:30:00Z")]]),
      });

      it("should format dates using D3 format library", async () => {
        const expr = parseExpression('formatDate(testDate, "%Y-%m-%d")');
        const result = await calculator.evaluate(expr);
        expect(result.success).toBe(true);
        expect(result.value).toBe("2024-03-15");
      });

      it("should extract year from date", async () => {
        const expr = parseExpression('extractDateComponent(testDate, "year")');
        const result = await calculator.evaluate(expr);
        expect(result.success).toBe(true);
        expect(result.value).toBe(2024);
      });

      it("should extract month from date", async () => {
        const expr = parseExpression('extractDateComponent(testDate, "month")');
        const result = await calculator.evaluate(expr);
        expect(result.success).toBe(true);
        expect(result.value).toBe(3); // March
      });

      it("should extract day from date", async () => {
        const expr = parseExpression('extractDateComponent(testDate, "day")');
        const result = await calculator.evaluate(expr);
        expect(result.success).toBe(true);
        expect(result.value).toBe(15);
      });

      it("should extract quarter from date", async () => {
        const expr = parseExpression(
          'extractDateComponent(testDate, "quarter")'
        );
        const result = await calculator.evaluate(expr);
        expect(result.success).toBe(true);
        expect(result.value).toBe(1); // Q1
      });

      it("should extract week number from date", async () => {
        const expr = parseExpression('extractDateComponent(testDate, "week")');
        const result = await calculator.evaluate(expr);
        expect(result.success).toBe(true);
        expect(result.value).toBe(11); // Week 11 of 2024
      });
    });

    describe("String Operations", () => {
      it.todo("should concatenate strings");
      it.todo("should extract substrings");
      it.todo("should perform pattern matching/replacement");
    });

    describe("Statistical Functions", () => {
      it.todo("should calculate percentiles");
      it.todo("should calculate standard deviation");
      it.todo("should calculate variance");
      it.todo("should calculate median");
      it.todo("should calculate z-scores");
    });

    describe("Advanced Analytics", () => {
      it.todo("should perform self-organizing maps (Kohonen)");
      it.todo("should perform PCA with first component extraction");
      it.todo("should perform PCA with second component extraction");
      it.todo("should perform UMAP transformation");
      it.todo("should perform t-SNE transformation");
    });

    describe("Regression Analysis", () => {
      it.todo("should perform linear regression");
      it.todo("should perform polynomial regression");
      it.todo("should calculate regression residuals");
      it.todo("should perform ANOVA/factor analysis");
    });

    describe("Data Transformation", () => {
      it.todo("should normalize data");
      it.todo("should standardize data");
      it.todo("should perform logarithmic transformations");
      it.todo("should perform binning/bucketing of numeric values");
      it.todo("should create dummy variables");
    });
  });
});
