import { type Expression } from "./types";

interface ExtendedExpression extends Expression {
  value?: any;
  left?: Expression;
  right?: Expression;
  operand?: Expression;
}

export function evaluate(expr: ExtendedExpression): number {
  if (expr.type === "literal") {
    if (expr.value !== undefined) {
      return Number(expr.value);
    }
    return Number(expr.name);
  }

  if (expr.type === "basic") {
    // Handle identifiers
    if (!expr.left && !expr.right && expr.dependencies.length > 0) {
      throw new Error(`Cannot evaluate identifier: ${expr.name}`);
    }

    if (expr.left && expr.right) {
      const left = evaluate(expr.left);
      const right = evaluate(expr.right);

      switch (expr.expression) {
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
          throw new Error(`Unknown operator: ${expr.expression}`);
      }
    }

    // If no left/right properties, try to parse from name
    const parts = expr.name.trim().split(/\s+/);
    if (parts.length === 1) {
      // This is a literal or identifier
      const value = Number(expr.name);
      if (isNaN(value)) {
        throw new Error(`Cannot evaluate identifier: ${expr.name}`);
      }
      return value;
    }

    if (parts.length !== 3) {
      throw new Error(`Invalid basic expression: ${expr.name}`);
    }

    const [leftStr, , rightStr] = parts;
    const leftValue = Number(leftStr);
    const rightValue = Number(rightStr);

    if (isNaN(leftValue) || isNaN(rightValue)) {
      throw new Error(`Invalid operands in expression: ${expr.name}`);
    }

    switch (expr.expression) {
      case "+":
        return leftValue + rightValue;
      case "-":
        return leftValue - rightValue;
      case "*":
        return leftValue * rightValue;
      case "/":
        if (rightValue === 0) {
          throw new Error("Division by zero");
        }
        return leftValue / rightValue;
      case "^":
        return Math.pow(leftValue, rightValue);
      default:
        throw new Error(`Unknown operator: ${expr.expression}`);
    }
  }

  if (expr.type === "unary") {
    if (expr.operand) {
      const operand = evaluate(expr.operand);

      switch (expr.expression) {
        case "-":
          return -operand;
        case "+":
          return operand;
        default:
          throw new Error(`Unknown unary operator: ${expr.expression}`);
      }
    }

    // If no operand property, try to parse from name
    const operandStr = expr.name.substring(1);
    const operandValue = Number(operandStr);
    if (isNaN(operandValue)) {
      throw new Error(`Invalid operand in unary expression: ${expr.name}`);
    }

    switch (expr.expression) {
      case "-":
        return -operandValue;
      case "+":
        return operandValue;
      default:
        throw new Error(`Unknown unary operator: ${expr.expression}`);
    }
  }

  throw new Error(`Unsupported expression type: ${expr.type}`);
}
