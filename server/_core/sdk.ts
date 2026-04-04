import { COOKIE_NAME } from "@shared/const";
import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

function ForbiddenError(message: string) {
  return new Error(message);
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

class AuthServer {
  constructor() {
    if (!ENV.cookieSecret) {
      console.warn("[Auth] WARNING: JWT_SECRET is not configured!");
    }
  }

  parseCookies(cookieHeader: string | undefined): Map<string, string> {
    const map = new Map<string, string>();
    if (!cookieHeader) return map;
    for (const pair of cookieHeader.split(";")) {
      const idx = pair.indexOf("=");
      if (idx < 0) continue;
      const key = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      map.set(key, decodeURIComponent(value));
    }
    return map;
  }

  private getSessionSecret() {
    return new TextEncoder().encode(ENV.cookieSecret);
  }

  async createSessionToken(
    openId: string,
    options: { name?: string; email?: string; role?: string; expiresInMs?: number } = {}
  ): Promise<string> {
    const expiresInMs = options.expiresInMs ?? 1000 * 60 * 60 * 24 * 365;
    const secretKey = this.getSessionSecret();
    const issuedAt = Date.now();
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);

    return new SignJWT({
      openId,
      appId: ENV.appId,
      name: options.name || "",
      email: options.email || "",
      role: options.role || "user",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; appId: string; name: string } | null> {
    if (!cookieValue) return null;
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, appId, name } = payload as Record<string, unknown>;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId: openId as string,
        appId: appId as string,
        name: (name as string) || "",
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const user = await db.getUserByOpenId(session.openId);
    if (!user) {
      throw ForbiddenError("User not found");
    }

    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: new Date(),
    });

    return user;
  }
}

export const sdk = new AuthServer();
