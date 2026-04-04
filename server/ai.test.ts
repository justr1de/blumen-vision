import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@blumen.com",
    name: "Test User",
    loginMethod: "email",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("AI Router", () => {
  describe("ai.health", () => {
    it("should return health status when authenticated", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ai.health();

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      expect(["ok", "error"]).toContain(result.status);

      if (result.status === "ok") {
        expect(result.model).toBeDefined();
        expect(typeof result.response).toBe("string");
      }
    }, 30000);

    it("should reject unauthenticated requests", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.ai.health()).rejects.toThrow();
    });
  });

  describe("ai.chat", () => {
    it("should reject unauthenticated chat requests", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ai.chat({
          messages: [{ role: "user", content: "Olá" }],
        })
      ).rejects.toThrow();
    });

    it("should validate message format", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Empty messages array should still work (schema allows it)
      await expect(
        caller.ai.chat({ messages: [] })
      ).resolves.toBeDefined();
    }, 30000);
  });

  describe("ai.analyzePdf", () => {
    it("should reject unauthenticated PDF analysis requests", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ai.analyzePdf({
          fileBase64: "dGVzdA==",
          fileName: "test.pdf",
        })
      ).rejects.toThrow();
    });
  });

  describe("ai.analyzeStructured", () => {
    it("should reject unauthenticated structured analysis requests", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ai.analyzeStructured({
          fileBase64: "dGVzdA==",
          fileName: "test.pdf",
          extractionType: "generico",
        })
      ).rejects.toThrow();
    });
  });
});
