import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
  type ConsoleMessage,
  type Request,
  type Response,
} from "playwright-core";

export type ConsoleEntry = {
  type: string;
  text: string;
  timestamp: string;
  location?: { url?: string; lineNumber?: number; columnNumber?: number };
};

export type NetworkEntry = {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  resourceType?: string;
  status?: number;
  ok?: boolean;
  failureText?: string;
};

export type PageError = {
  message: string;
  name?: string;
  stack?: string;
  timestamp: string;
};

const MAX_CONSOLE = 500;
const MAX_NETWORK = 500;
const MAX_ERRORS = 200;

class BrowserSession {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  private consoleBuffer: ConsoleEntry[] = [];
  private networkBuffer: NetworkEntry[] = [];
  private errorBuffer: PageError[] = [];
  private requestIds = new WeakMap<Request, string>();
  private nextRequestId = 0;

  async start(headless = true): Promise<void> {
    if (this.browser) {
      throw new Error("Browser already running");
    }

    this.browser = await chromium.launch({ headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    this.setupListeners();
  }

  async stop(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      this.clearBuffers();
    }
  }

  isRunning(): boolean {
    return this.browser !== null && this.page !== null;
  }

  getPage(): Page {
    if (!this.page) {
      throw new Error("Browser not running. Call browser_start first.");
    }
    return this.page;
  }

  getStatus(): {
    running: boolean;
    url?: string;
    title?: string;
    consoleCount: number;
    networkCount: number;
    errorCount: number;
  } {
    return {
      running: this.isRunning(),
      url: this.page?.url(),
      title: undefined, // Would need async call
      consoleCount: this.consoleBuffer.length,
      networkCount: this.networkBuffer.length,
      errorCount: this.errorBuffer.length,
    };
  }

  getConsole(level?: string, clear = false): ConsoleEntry[] {
    let entries = this.consoleBuffer;
    if (level) {
      entries = entries.filter((e) => e.type === level);
    }
    if (clear) {
      this.consoleBuffer = [];
    }
    return entries;
  }

  getNetwork(filter?: string, clear = false): NetworkEntry[] {
    let entries = this.networkBuffer;
    if (filter) {
      entries = entries.filter((e) => e.url.includes(filter));
    }
    if (clear) {
      this.networkBuffer = [];
    }
    return entries;
  }

  getErrors(clear = false): PageError[] {
    const entries = this.errorBuffer;
    if (clear) {
      this.errorBuffer = [];
    }
    return entries;
  }

  private clearBuffers(): void {
    this.consoleBuffer = [];
    this.networkBuffer = [];
    this.errorBuffer = [];
    this.nextRequestId = 0;
  }

  private setupListeners(): void {
    if (!this.page) return;

    this.page.on("console", (msg: ConsoleMessage) => {
      const entry: ConsoleEntry = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
        location: msg.location(),
      };
      this.consoleBuffer.push(entry);
      if (this.consoleBuffer.length > MAX_CONSOLE) {
        this.consoleBuffer.shift();
      }
    });

    this.page.on("pageerror", (err: Error) => {
      this.errorBuffer.push({
        message: err?.message ?? String(err),
        name: err?.name,
        stack: err?.stack,
        timestamp: new Date().toISOString(),
      });
      if (this.errorBuffer.length > MAX_ERRORS) {
        this.errorBuffer.shift();
      }
    });

    this.page.on("request", (req: Request) => {
      this.nextRequestId += 1;
      const id = `r${this.nextRequestId}`;
      this.requestIds.set(req, id);
      this.networkBuffer.push({
        id,
        timestamp: new Date().toISOString(),
        method: req.method(),
        url: req.url(),
        resourceType: req.resourceType(),
      });
      if (this.networkBuffer.length > MAX_NETWORK) {
        this.networkBuffer.shift();
      }
    });

    this.page.on("response", (resp: Response) => {
      const req = resp.request();
      const id = this.requestIds.get(req);
      if (!id) return;
      const entry = this.networkBuffer.find((e) => e.id === id);
      if (entry) {
        entry.status = resp.status();
        entry.ok = resp.ok();
      }
    });

    this.page.on("requestfailed", (req: Request) => {
      const id = this.requestIds.get(req);
      if (!id) return;
      const entry = this.networkBuffer.find((e) => e.id === id);
      if (entry) {
        entry.failureText = req.failure()?.errorText;
        entry.ok = false;
      }
    });
  }
}

// Singleton instance
export const browserSession = new BrowserSession();
