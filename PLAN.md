# agent-browse Implementation Plan

Stateful browser automation MCP server for Claude Code. Provides low-level browser primitives with console/network observability.

## Architecture

```
Claude Code
    │
    └─► MCP Server (stdio)
            │
            └─► Browser Daemon (persistent Playwright session)
                    │
                    ├── Page state (URL, DOM)
                    ├── Console buffer (last 500 messages)
                    ├── Network buffer (last 500 requests)
                    └── Error buffer (last 200 errors)
```

**Key design**: Browser session persists across MCP tool calls. Navigate in one call, click in another, check console in a third - all same session.

## MCP Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `browser_start` | Launch browser session | `headless?: boolean` |
| `browser_stop` | Close browser session | - |
| `browser_status` | Get session status | - |
| `browser_navigate` | Go to URL | `url: string` |
| `browser_click` | Click element | `selector: string` |
| `browser_fill` | Fill input field | `selector: string, value: string` |
| `browser_select` | Select dropdown option | `selector: string, value: string` |
| `browser_type` | Type keys | `text: string` |
| `browser_press` | Press key | `key: string` |
| `browser_hover` | Hover element | `selector: string` |
| `browser_screenshot` | Capture page | `fullPage?: boolean` |
| `browser_snapshot` | Get accessibility tree | `maxChars?: number` |
| `browser_console` | Get console logs | `level?: string, clear?: boolean` |
| `browser_requests` | Get network requests | `filter?: string, clear?: boolean` |
| `browser_errors` | Get page errors | `clear?: boolean` |
| `browser_evaluate` | Run JavaScript | `script: string` |
| `browser_wait` | Wait for selector | `selector: string, timeout?: number` |
| `browser_wait_network` | Wait for network idle | `timeout?: number` |

## File Structure

```
agent-browse/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── server.ts             # MCP protocol handling
│   ├── browser/
│   │   ├── session.ts        # Playwright session management
│   │   ├── actions.ts        # Click, fill, navigate, etc.
│   │   ├── observe.ts        # Console, network, errors
│   │   └── snapshot.ts       # Accessibility tree
│   └── tools/
│       └── definitions.ts    # MCP tool schemas
├── package.json
├── tsconfig.json
├── README.md
├── PLAN.md
└── .gitignore
```

## Implementation Phases

### Phase 1: Project Setup
- [ ] Initialize npm package
- [ ] Add dependencies: `@modelcontextprotocol/sdk`, `playwright-core`
- [ ] Configure TypeScript
- [ ] Create basic MCP server skeleton

### Phase 2: Browser Session
- [ ] Implement session manager (start/stop/status)
- [ ] Persistent Playwright browser instance
- [ ] Page state tracking
- [ ] Headless/headed mode support

### Phase 3: Core Actions
- [ ] navigate (with wait for load)
- [ ] click (by selector)
- [ ] fill (input fields)
- [ ] select (dropdowns)
- [ ] type/press (keyboard)
- [ ] hover
- [ ] wait (selector, network idle)

### Phase 4: Observability
- [ ] Console log capture (buffer last 500)
- [ ] Network request tracking (buffer last 500)
- [ ] Page error capture (buffer last 200)
- [ ] Screenshot capture
- [ ] Accessibility tree snapshot

### Phase 5: MCP Integration
- [ ] Define all tool schemas
- [ ] Wire tools to browser actions
- [ ] Error handling and reporting
- [ ] Test with Claude Code

### Phase 6: Polish
- [ ] README with installation instructions
- [ ] Example usage
- [ ] Edge case handling

## Dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.52.0",
    "@modelcontextprotocol/sdk": "^1.12.0",
    "playwright-core": "^1.52.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.7.0"
  }
}
```

## Usage (after implementation)

```bash
# Install
cd agent-browse && npm install && npm run build

# Add to Claude Code
claude mcp add --transport stdio agent-browse -- node /path/to/agent-browse/dist/index.js

# Or add to .mcp.json
{
  "mcpServers": {
    "agent-browse": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/agent-browse/dist/index.js"]
    }
  }
}
```

## Derived From

Browser layer architecture inspired by [clawdbot](https://github.com/clawdbot/clawdbot)'s Playwright implementation, adapted for standalone MCP server use.
