import { browserSession } from "./session.js";

export async function navigate(url: string): Promise<{ url: string; title: string }> {
  const page = browserSession.getPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  return {
    url: page.url(),
    title: await page.title(),
  };
}

export async function click(selector: string): Promise<void> {
  const page = browserSession.getPage();
  await page.click(selector);
}

export async function fill(selector: string, value: string): Promise<void> {
  const page = browserSession.getPage();
  await page.fill(selector, value);
}

export async function selectOption(selector: string, value: string): Promise<void> {
  const page = browserSession.getPage();
  await page.selectOption(selector, value);
}

export async function type(text: string): Promise<void> {
  const page = browserSession.getPage();
  await page.keyboard.type(text);
}

export async function press(key: string): Promise<void> {
  const page = browserSession.getPage();
  await page.keyboard.press(key);
}

export async function hover(selector: string): Promise<void> {
  const page = browserSession.getPage();
  await page.hover(selector);
}

export async function screenshot(fullPage = false): Promise<string> {
  const page = browserSession.getPage();
  const buffer = await page.screenshot({ fullPage, type: "png" });
  return buffer.toString("base64");
}

export async function evaluate(script: string): Promise<unknown> {
  const page = browserSession.getPage();
  return await page.evaluate(script);
}

export async function waitForSelector(
  selector: string,
  timeout = 30000
): Promise<void> {
  const page = browserSession.getPage();
  await page.waitForSelector(selector, { timeout });
}

export async function waitForNetworkIdle(timeout = 30000): Promise<void> {
  const page = browserSession.getPage();
  await page.waitForLoadState("networkidle", { timeout });
}

export async function getContent(): Promise<string> {
  const page = browserSession.getPage();
  return await page.content();
}

export async function getUrl(): Promise<string> {
  const page = browserSession.getPage();
  return page.url();
}

export async function getTitle(): Promise<string> {
  const page = browserSession.getPage();
  return await page.title();
}
