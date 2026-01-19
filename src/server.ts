import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { browserSession } from "./browser/session.js";
import * as actions from "./browser/actions.js";
import { getSnapshot } from "./browser/snapshot.js";
import { toolDefinitions } from "./tools/definitions.js";

export function createServer(): Server {
  const server = new Server(
    {
      name: "agent-browse",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: toolDefinitions };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await handleTool(name, args ?? {});
      return {
        content: [
          {
            type: "text",
            text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  return server;
}

async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "browser_start": {
      const headless = (args.headless as boolean) ?? true;
      await browserSession.start(headless);
      return { status: "started", headless };
    }

    case "browser_stop": {
      await browserSession.stop();
      return { status: "stopped" };
    }

    case "browser_status": {
      return browserSession.getStatus();
    }

    case "browser_navigate": {
      const url = args.url as string;
      return await actions.navigate(url);
    }

    case "browser_click": {
      const selector = args.selector as string;
      await actions.click(selector);
      return { clicked: selector };
    }

    case "browser_fill": {
      const selector = args.selector as string;
      const value = args.value as string;
      await actions.fill(selector, value);
      return { filled: selector, value };
    }

    case "browser_select": {
      const selector = args.selector as string;
      const value = args.value as string;
      await actions.selectOption(selector, value);
      return { selected: selector, value };
    }

    case "browser_type": {
      const text = args.text as string;
      await actions.type(text);
      return { typed: text };
    }

    case "browser_press": {
      const key = args.key as string;
      await actions.press(key);
      return { pressed: key };
    }

    case "browser_hover": {
      const selector = args.selector as string;
      await actions.hover(selector);
      return { hovered: selector };
    }

    case "browser_screenshot": {
      const fullPage = (args.fullPage as boolean) ?? false;
      const base64 = await actions.screenshot(fullPage);
      return {
        type: "image",
        format: "png",
        base64,
      };
    }

    case "browser_snapshot": {
      const maxChars = (args.maxChars as number) ?? 8000;
      const snapshot = await getSnapshot(maxChars);
      return snapshot;
    }

    case "browser_console": {
      const level = args.level as string | undefined;
      const clear = (args.clear as boolean) ?? false;
      const entries = browserSession.getConsole(level, clear);
      return { count: entries.length, entries };
    }

    case "browser_requests": {
      const filter = args.filter as string | undefined;
      const clear = (args.clear as boolean) ?? false;
      const entries = browserSession.getNetwork(filter, clear);
      return { count: entries.length, entries };
    }

    case "browser_errors": {
      const clear = (args.clear as boolean) ?? false;
      const entries = browserSession.getErrors(clear);
      return { count: entries.length, entries };
    }

    case "browser_evaluate": {
      const script = args.script as string;
      const result = await actions.evaluate(script);
      return { result };
    }

    case "browser_wait": {
      const selector = args.selector as string;
      const timeout = (args.timeout as number) ?? 30000;
      await actions.waitForSelector(selector, timeout);
      return { waited: selector };
    }

    case "browser_wait_network": {
      const timeout = (args.timeout as number) ?? 30000;
      await actions.waitForNetworkIdle(timeout);
      return { status: "network idle" };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export async function runServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    await browserSession.stop();
    await server.close();
    process.exit(0);
  });
}
