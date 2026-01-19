import { z } from "zod";

// Note: We define schemas inline since MCP SDK handles validation

export const toolDefinitions = [
  {
    name: "browser_start",
    description: "Start a browser session. Must be called before other browser tools.",
    inputSchema: {
      type: "object" as const,
      properties: {
        headless: {
          type: "boolean",
          description: "Run browser in headless mode (default: true)",
          default: true,
        },
      },
    },
  },
  {
    name: "browser_stop",
    description: "Stop the browser session and clear all buffers.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "browser_status",
    description: "Get current browser session status including URL and buffer counts.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "browser_navigate",
    description: "Navigate to a URL. Waits for DOM content to load.",
    inputSchema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "The URL to navigate to",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "browser_click",
    description: "Click an element by CSS selector.",
    inputSchema: {
      type: "object" as const,
      properties: {
        selector: {
          type: "string",
          description: "CSS selector for the element to click",
        },
      },
      required: ["selector"],
    },
  },
  {
    name: "browser_fill",
    description: "Fill an input field with text. Clears existing content first.",
    inputSchema: {
      type: "object" as const,
      properties: {
        selector: {
          type: "string",
          description: "CSS selector for the input field",
        },
        value: {
          type: "string",
          description: "Text to fill in the field",
        },
      },
      required: ["selector", "value"],
    },
  },
  {
    name: "browser_select",
    description: "Select an option from a dropdown.",
    inputSchema: {
      type: "object" as const,
      properties: {
        selector: {
          type: "string",
          description: "CSS selector for the select element",
        },
        value: {
          type: "string",
          description: "Value or label of the option to select",
        },
      },
      required: ["selector", "value"],
    },
  },
  {
    name: "browser_type",
    description: "Type text using keyboard. Does not clear existing content.",
    inputSchema: {
      type: "object" as const,
      properties: {
        text: {
          type: "string",
          description: "Text to type",
        },
      },
      required: ["text"],
    },
  },
  {
    name: "browser_press",
    description: "Press a keyboard key (e.g., Enter, Tab, Escape, ArrowDown).",
    inputSchema: {
      type: "object" as const,
      properties: {
        key: {
          type: "string",
          description: "Key to press (e.g., Enter, Tab, Escape)",
        },
      },
      required: ["key"],
    },
  },
  {
    name: "browser_hover",
    description: "Hover over an element.",
    inputSchema: {
      type: "object" as const,
      properties: {
        selector: {
          type: "string",
          description: "CSS selector for the element to hover",
        },
      },
      required: ["selector"],
    },
  },
  {
    name: "browser_screenshot",
    description: "Take a screenshot of the current page. Returns base64 PNG.",
    inputSchema: {
      type: "object" as const,
      properties: {
        fullPage: {
          type: "boolean",
          description: "Capture full scrollable page (default: false)",
          default: false,
        },
      },
    },
  },
  {
    name: "browser_snapshot",
    description:
      "Get accessibility tree snapshot. Useful for understanding page structure without vision.",
    inputSchema: {
      type: "object" as const,
      properties: {
        maxChars: {
          type: "number",
          description: "Maximum characters to return (default: 8000)",
          default: 8000,
        },
      },
    },
  },
  {
    name: "browser_console",
    description: "Get console log messages from the page.",
    inputSchema: {
      type: "object" as const,
      properties: {
        level: {
          type: "string",
          description: "Filter by log level (log, warn, error, info)",
        },
        clear: {
          type: "boolean",
          description: "Clear buffer after reading (default: false)",
          default: false,
        },
      },
    },
  },
  {
    name: "browser_requests",
    description: "Get network requests made by the page.",
    inputSchema: {
      type: "object" as const,
      properties: {
        filter: {
          type: "string",
          description: "Filter URLs containing this string",
        },
        clear: {
          type: "boolean",
          description: "Clear buffer after reading (default: false)",
          default: false,
        },
      },
    },
  },
  {
    name: "browser_errors",
    description: "Get JavaScript errors from the page.",
    inputSchema: {
      type: "object" as const,
      properties: {
        clear: {
          type: "boolean",
          description: "Clear buffer after reading (default: false)",
          default: false,
        },
      },
    },
  },
  {
    name: "browser_evaluate",
    description: "Execute JavaScript in the page context.",
    inputSchema: {
      type: "object" as const,
      properties: {
        script: {
          type: "string",
          description: "JavaScript code to execute",
        },
      },
      required: ["script"],
    },
  },
  {
    name: "browser_wait",
    description: "Wait for an element to appear.",
    inputSchema: {
      type: "object" as const,
      properties: {
        selector: {
          type: "string",
          description: "CSS selector to wait for",
        },
        timeout: {
          type: "number",
          description: "Timeout in milliseconds (default: 30000)",
          default: 30000,
        },
      },
      required: ["selector"],
    },
  },
  {
    name: "browser_wait_network",
    description: "Wait for network activity to settle.",
    inputSchema: {
      type: "object" as const,
      properties: {
        timeout: {
          type: "number",
          description: "Timeout in milliseconds (default: 30000)",
          default: 30000,
        },
      },
    },
  },
];
