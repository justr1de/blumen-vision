/**
 * Maps — placeholder (Manus Forge proxy removed)
 * Use Google Maps API directly with your own API key if needed.
 */
export async function makeRequest(_path: string, _params: Record<string, unknown>): Promise<unknown> {
  console.warn("[Maps] Not configured. Use Google Maps API directly.");
  throw new Error("Maps service not configured");
}
