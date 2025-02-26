import { type Expression } from "../types";
import ohm from "ohm-js";
import fs from "fs";
import path from "path";

// Load the grammar
const grammarFile = path.join(__dirname, "grammar.ohm");
const grammar = ohm.grammar(fs.readFileSync(grammarFile, "utf-8"));

export interface ParsedExpression {
  type: string;
  value?: any;
  children?: ParsedExpression[];
  operator?: string;
  left?: ParsedExpression;
  right?: ParsedExpression;
  name?: string;
  arguments?: ParsedExpression[];
  operand?: ParsedExpression;
  condition?: ParsedExpression;
  trueBranch?: ParsedExpression;
  falseBranch?: ParsedExpression;
}

type Node = ohm.Node;

// Create semantics
const semantics = grammar.createSemantics();

semantics.addOperation<ParsedExpression>("eval", {
  Expression(e: Node): ParsedExpression {
    return e.eval();
  },
  BinaryExpr(left: Node, op: Node, right: Node): ParsedExpression {
    return {
      type: "binary",
      value: undefined,
      operator: op.sourceString,
      left: left.eval(),
      right: right.eval(),
    };
  },
  TernaryExpr(
    condition: Node,
    _q: Node,
    trueBranch: Node,
    _c: Node,
    falseBranch: Node
  ): ParsedExpression {
    return {
      type: "ternary",
      value: undefined,
      condition: condition.eval(),
      trueBranch: trueBranch.eval(),
      falseBranch: falseBranch.eval(),
    };
  },
  UnaryExpr(op: Node, expr: Node): ParsedExpression {
    return {
      type: "unary",
      value: undefined,
      operator: op.sourceString,
      operand: expr.eval(),
    };
  },
  FunctionCall(
    name: Node,
    _open: Node,
    args: Node,
    _close: Node
  ): ParsedExpression {
    return {
      type: "function",
      value: undefined,
      name: name.sourceString,
      arguments: args.asIteration().children.map((arg: Node) => arg.eval()),
    };
  },
  Term_parentheses(_open: Node, expr: Node, _close: Node): ParsedExpression {
    return expr.eval();
  },
  number(_: Node): ParsedExpression {
    return {
      type: "literal",
      value: parseFloat(this.sourceString),
    };
  },
  string(_open: Node, chars: Node, _close: Node): ParsedExpression {
    return {
      type: "literal",
      value: this.sourceString.slice(1, -1),
    };
  },
  identifier(_: Node): ParsedExpression {
    return {
      type: "identifier",
      value: undefined,
      name: this.sourceString,
    };
  },
});

export function parseExpression(input: string): Expression {
  const matchResult = grammar.match(input);

  if (matchResult.failed()) {
    throw new Error(`Parse error: ${matchResult.message}`);
  }

  const parsed = semantics(matchResult).eval();

  // Convert the parsed expression to our Expression type
  return convertToExpression(parsed);
}

function convertToExpression(parsed: ParsedExpression): Expression {
  const id = crypto.randomUUID();

  switch (parsed.type) {
    case "binary":
      return {
        id,
        type: "basic",
        name: `${parsed.left?.name || ""} ${parsed.operator} ${
          parsed.right?.name || ""
        }`,
        expression: parsed.operator || "",
        dependencies: getDependencies(parsed),
      };
    case "function":
      return {
        id,
        type: "function",
        name: parsed.name || "",
        expression: "",
        functionName: parsed.name,
        arguments: parsed.arguments?.map(convertToExpression) || [],
        dependencies: getDependencies(parsed),
      };
    case "identifier":
      return {
        id,
        type: "basic",
        name: parsed.name || "",
        expression: parsed.name || "",
        dependencies: [parsed.name || ""],
      };
    default:
      return {
        id,
        type: "basic",
        name: String(parsed.value),
        expression: String(parsed.value),
        dependencies: [],
      };
  }
}

function getDependencies(parsed: ParsedExpression): string[] {
  const deps = new Set<string>();

  function collect(expr: ParsedExpression) {
    if (expr.type === "identifier" && expr.name) {
      deps.add(expr.name);
    }
    if (expr.children) {
      expr.children.forEach(collect);
    }
    if (expr.arguments) {
      expr.arguments.forEach(collect);
    }
    if (expr.left) {
      collect(expr.left);
      collect(expr.right!);
    }
  }

  collect(parsed);
  return Array.from(deps);
}

export default semantics;
