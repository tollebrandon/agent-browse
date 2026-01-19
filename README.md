# agent-browse

Stateful browser automation plugin for Claude Code. Control a browser across multiple tool calls with full console/network observability.

## Features

- **Stateful sessions** - Browser persists across tool calls. Navigate, then click, then check console - all in the same session.
- **Console capture** - Get console.log, warnings, and errors (last 500 messages)
- **Network tracking** - See all network requests with status codes (last 500 requests)
- **Error capture** - Catch JavaScript errors with stack traces (last 200 errors)
- **Accessibility snapshots** - Get page structure as text for AI reasoning
- **Screenshots** - Capture full page or viewport
- **Browser subagent** - Claude auto-delegates browser tasks to a specialized agent

## Installation

### Prerequisites

- Node.js 20+
- Chrome/Chromium (Playwright will use system Chrome or download one)

### Build

```bash
git clone https://github.com/tollebrandon/agent-browse.git
cd agent-browse
npm install
npm run build
```

### Add to Claude Code

**Option 1: As a Plugin (recommended)**

```bash
claude plugin install /path/to/agent-browse
```

This installs both the MCP server and the browser subagent.

**Option 2: MCP Server Only**

```bash
claude mcp add --transport stdio agent-browse -- node /path/to/agent-browse/dist/index.js
```

**Option 3: Project config (.mcp.json)**

Create `.mcp.json` in your project root:

```json
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

### Verify Installation

In Claude Code:
```
/mcp
```

You should see `agent-browse` listed with its tools.

## Tools

| Tool | Description |
|------|-------------|
| `browser_start` | Start browser session (headless by default) |
| `browser_stop` | Stop browser and clear buffers |
| `browser_status` | Get session status, URL, buffer counts |
| `browser_navigate` | Go to URL |
| `browser_click` | Click element by selector |
| `browser_fill` | Fill input field |
| `browser_select` | Select dropdown option |
| `browser_type` | Type text via keyboard |
| `browser_press` | Press key (Enter, Tab, etc.) |
| `browser_hover` | Hover over element |
| `browser_screenshot` | Capture page as PNG |
| `browser_snapshot` | Get accessibility tree |
| `browser_console` | Get console messages |
| `browser_requests` | Get network requests |
| `browser_errors` | Get page errors |
| `browser_evaluate` | Run JavaScript |
| `browser_wait` | Wait for selector |
| `browser_wait_network` | Wait for network idle |

## Example Usage

```
You: Start a browser and go to example.com

Claude: [browser_start] [browser_navigate url="https://example.com"]
        Page loaded: "Example Domain"

You: Click the "More information" link

Claude: [browser_click selector="a"]
        Clicked the link, navigated to IANA page.

You: Any console errors?

Claude: [browser_console level="error"]
        No errors found.

You: Take a screenshot

Claude: [browser_screenshot]
        [Image of current page]

You: What network requests were made?

Claude: [browser_requests]
        Found 3 requests:
        - GET https://example.com (200)
        - GET https://www.iana.org/... (200)
        - GET https://www.iana.org/favicon.ico (200)
```

## Headless vs Headed

By default, the browser runs headless (no visible window). To see the browser:

```
browser_start with headless=false
```

## License

MIT
