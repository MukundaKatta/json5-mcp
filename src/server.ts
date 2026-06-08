#!/usr/bin/env node
/**
 * json5 MCP server. Two tools: `parse` and `stringify`.
 *
 * JSON5 is a JSON superset that allows comments, trailing commas, unquoted
 * keys, single-quoted strings, and a few other ergonomic relaxations.
 * Backed by the `json5` reference implementation.
 */

import { createRequire } from 'node:module';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import JSON5 from 'json5';

// Single source of truth: read the version from package.json so it never drifts.
// This resolves from both src/server.ts (tsx) and dist/server.js (node).
const require = createRequire(import.meta.url);
const { version: VERSION } = require('../package.json') as { version: string };

export function parse(text: string): unknown {
  return JSON5.parse(text);
}

export function stringify(value: unknown, indent: number = 2): string | undefined {
  return JSON5.stringify(value, undefined, indent);
}

const server = new Server({ name: 'json5', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'parse',
    description:
      'Parse JSON5 text into a JSON-compatible value. Allows comments, trailing commas, unquoted keys, and single-quoted strings.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
  },
  {
    name: 'stringify',
    description: 'Serialize a value to JSON5 (still valid JSON if indent is 0).',
    inputSchema: {
      type: 'object',
      properties: {
        value: { description: 'Any JSON value.' },
        indent: { type: 'integer', default: 2, minimum: 0, maximum: 10 },
      },
      required: ['value'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name === 'parse') {
      const a = args as unknown as { text: string };
      return jsonResult({ value: parse(a.text) });
    }
    if (name === 'stringify') {
      const a = args as unknown as { value: unknown; indent?: number };
      const out = stringify(a.value, a.indent ?? 2);
      // JSON5.stringify returns undefined for values with no JSON representation
      // (undefined, functions, symbols). Surface a clean tool error instead of
      // emitting an undefined text field, which violates the MCP content schema.
      if (out === undefined) {
        return errorResult('stringify failed: value has no JSON5 representation');
      }
      return textResult(out);
    }
    return errorResult('unknown tool: ' + name);
  } catch (err) {
    return errorResult('json5 failed: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function textResult(text: string) {
  return { content: [{ type: 'text', text }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`json5 MCP server v${VERSION} ready on stdio\n`);
}
