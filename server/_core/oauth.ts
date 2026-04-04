import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { SUPER_ADMIN_EMAILS, ADMIN_EMAIL_DOMAINS } from "@shared/const";

function determineRole(email: string): string {
  const emailLower = email.toLowerCase().trim();
  if (SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === emailLower)) return "super_admin";
  const domain = emailLower.split("@")[1];
  if (domain && ADMIN_EMAIL_DOMAINS.some(d => d.toLowerCase() === domain)) return "admin";
  return "user";
}

export function registerOAuthRoutes(app: Express) {
  // Login por email/senha
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Email e senha são obrigatórios" });
        return;
      }

      const user = await db.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: "Email ou senha incorretos" });
        return;
      }

      // Verificar senha (hash bcrypt armazenado no campo passwordHash)
      const bcrypt = await import("bcryptjs");
      if (!user.passwordHash) {
        res.status(401).json({ error: "Conta sem senha configurada. Use o registro." });
        return;
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Email ou senha incorretos" });
        return;
      }

      // Criar sessão JWT
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Atualizar último login
      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

      res.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Erro interno no login" });
    }
  });

  // Registro por email/senha
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
        return;
      }

      // Verificar se já existe
      const existing = await db.getUserByEmail(email);
      if (existing) {
        res.status(409).json({ error: "Este email já está cadastrado" });
        return;
      }

      // Hash da senha
      const bcrypt = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(password, 12);

      // Determinar role automaticamente
      const role = determineRole(email);

      // Criar usuário (openId = email para auth local)
      const openId = `local_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;
      await db.upsertUser({
        openId,
        name,
        email: email.toLowerCase(),
        loginMethod: "email",
        role,
        lastSignedIn: new Date(),
      });

      // Salvar hash da senha
      await db.updateUserPassword(openId, passwordHash);

      // Criar sessão
      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        email,
        role,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { name, email, role } });
    } catch (error) {
      console.error("[Auth] Register failed:", error);
      res.status(500).json({ error: "Erro interno no registro" });
    }
  });

  // Manter compatibilidade com rota antiga (redireciona para login)
  app.get("/api/oauth/callback", (_req: Request, res: Response) => {
    res.redirect(302, "/login");
  });
}
