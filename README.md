# json5-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/json5-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/json5-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

MCP server: parse and stringify JSON5. Use this when you've got a config
file with comments, trailing commas, or unquoted keys that plain JSON would
choke on.

## Tools

### `parse`

```json
{ "text": "{ /* settings */ retries: 3, hosts: ['a', 'b'], }" }
```

→ `{ "value": { "retries": 3, "hosts": ["a", "b"] } }`

Accepts the full JSON5 grammar: block + line comments, unquoted keys,
single-quoted strings, trailing commas, hex numbers, leading/trailing
decimal points, `+Infinity`, `NaN`.

### `stringify`

```json
{ "value": { "a": 1, "b": [2, 3] }, "indent": 2 }
```

→ JSON5 output (still valid JSON when indent=0).

## Configure

```json
{ "mcpServers": { "json5": { "command": "npx", "args": ["-y", "@mukundakatta/json5-mcp"] } } }
```

## License

MIT.
