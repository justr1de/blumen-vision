import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { SUPER_ADMIN_EMAILS, ADMIN_EMAIL_DOMAINS } from '../shared/const';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Determina o role automático baseado no email do usuário:
 * 1. Emails específicos em SUPER_ADMIN_EMAILS → super_admin
 * 2. Domínio em ADMIN_EMAIL_DOMAINS → admin
 * 3. Owner do app (openId) → admin
 * 4. Todos os outros → user
 */
function determineAutoRole(email: string | null | undefined, openId: string): 'super_admin' | 'admin' | 'user' {
  if (email) {
    const emailLower = email.toLowerCase().trim();

    // Super admin: emails explicitamente listados
    if (SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === emailLower)) {
      return 'super_admin';
    }

    // Admin: domínios autorizados
    const domain = emailLower.split('@')[1];
    if (domain && ADMIN_EMAIL_DOMAINS.some(d => d.toLowerCase() === domain)) {
      return 'admin';
    }
  }

  // Owner do app → admin
  if (openId === ENV.ownerOpenId) {
    return 'admin';
  }

  return 'user';
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    // Auto-atribuição de role baseada no email
    if (user.role !== undefined) {
      // Se um role explícito foi passado, respeitar
      values.role = user.role;
      updateSet.role = user.role;
    } else {
      // Determinar role automaticamente
      const autoRole = determineAutoRole(user.email, user.openId);
      values.role = autoRole;
      updateSet.role = autoRole;
      console.log(`[Auth] Auto-assigned role '${autoRole}' for user ${user.email || user.openId}`);
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.
