import { describe, expect, it } from "vitest";

/**
 * Testa a conectividade com a API Gemini usando a chave configurada.
 * Este teste valida que a GEMINI_API_KEY está correta e funcional.
 */
describe("Gemini API Key Validation", () => {
  it("should successfully call the Gemini API with the configured key", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey).toBeTruthy();
    expect(apiKey).toMatch(/^AIza/);

    // Lightweight call to Gemini API to validate the key
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.models).toBeDefined();
    expect(data.models.length).toBeGreaterThan(0);

    // Verify that gemini-2.5-flash is available
    const modelNames = data.models.map((m: { name: string }) => m.name);
    const hasGeminiFlash = modelNames.some((name: string) =>
      name.includes("gemini")
    );
    expect(hasGeminiFlash).toBe(true);
  }, 15000);
});
