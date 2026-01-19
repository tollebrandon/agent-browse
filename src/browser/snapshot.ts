import { browserSession } from "./session.js";

export async function getSnapshot(maxChars = 8000): Promise<string> {
  const page = browserSession.getPage();

  // Use ARIA snapshot for accessibility tree
  // This returns a YAML-like format showing the accessibility structure
  try {
    const snapshot = await page.locator("body").ariaSnapshot();

    if (!snapshot) {
      return "[No accessibility tree available]";
    }

    // Truncate if too long
    if (snapshot.length > maxChars) {
      return snapshot.slice(0, maxChars) + "\n... (truncated)";
    }

    return snapshot;
  } catch {
    // Fallback: return page text content if ARIA snapshot fails
    const text = await page.locator("body").innerText();
    if (text.length > maxChars) {
      return text.slice(0, maxChars) + "\n... (truncated)";
    }
    return text;
  }
}
