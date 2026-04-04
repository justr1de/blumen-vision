import { describe, it, expect } from 'vitest';
import { SUPER_ADMIN_EMAILS, ADMIN_EMAIL_DOMAINS } from '../shared/const';

/**
 * Replica a lógica de determineAutoRole do db.ts para testes unitários
 * sem depender de conexão com banco de dados
 */
function determineAutoRole(email: string | null | undefined, _openId: string): 'super_admin' | 'admin' | 'user' {
  if (email) {
    const emailLower = email.toLowerCase().trim();

    if (SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === emailLower)) {
      return 'super_admin';
    }

    const domain = emailLower.split('@')[1];
    if (domain && ADMIN_EMAIL_DOMAINS.some(d => d.toLowerCase() === domain)) {
      return 'admin';
    }
  }

  return 'user';
}

describe('Role auto-assignment', () => {
  describe('Super Admin emails', () => {
    it('should assign super_admin to contato@dataro-it.com.br', () => {
      expect(determineAutoRole('contato@dataro-it.com.br', 'some-id')).toBe('super_admin');
    });

    it('should assign super_admin to anderson@blumenbiz.com', () => {
      expect(determineAutoRole('anderson@blumenbiz.com', 'some-id')).toBe('super_admin');
    });

    it('should assign super_admin to camila@blumenbiz.com', () => {
      expect(determineAutoRole('camila@blumenbiz.com', 'some-id')).toBe('super_admin');
    });

    it('should be case-insensitive for super admin emails', () => {
      expect(determineAutoRole('CONTATO@DATARO-IT.COM.BR', 'some-id')).toBe('super_admin');
      expect(determineAutoRole('Anderson@BlumenBiz.com', 'some-id')).toBe('super_admin');
    });

    it('should handle whitespace in email', () => {
      expect(determineAutoRole('  contato@dataro-it.com.br  ', 'some-id')).toBe('super_admin');
    });
  });

  describe('Admin domain emails', () => {
    it('should assign admin to any @dataro-it.com.br email', () => {
      expect(determineAutoRole('suporte@dataro-it.com.br', 'some-id')).toBe('admin');
    });

    it('should assign admin to dev@dataro-it.com.br', () => {
      expect(determineAutoRole('dev@dataro-it.com.br', 'some-id')).toBe('admin');
    });

    it('should prioritize super_admin over admin for contato@dataro-it.com.br', () => {
      // contato@dataro-it.com.br is in SUPER_ADMIN_EMAILS, so it should be super_admin, not just admin
      expect(determineAutoRole('contato@dataro-it.com.br', 'some-id')).toBe('super_admin');
    });
  });

  describe('Regular users', () => {
    it('should assign user to regular email', () => {
      expect(determineAutoRole('joao@gmail.com', 'some-id')).toBe('user');
    });

    it('should assign user to blumenbiz.com email that is not in super admin list', () => {
      expect(determineAutoRole('outro@blumenbiz.com', 'some-id')).toBe('user');
    });

    it('should assign user when email is null', () => {
      expect(determineAutoRole(null, 'some-id')).toBe('user');
    });

    it('should assign user when email is undefined', () => {
      expect(determineAutoRole(undefined, 'some-id')).toBe('user');
    });
  });

  describe('Constants validation', () => {
    it('should have correct super admin emails', () => {
      expect(SUPER_ADMIN_EMAILS).toContain('contato@dataro-it.com.br');
      expect(SUPER_ADMIN_EMAILS).toContain('anderson@blumenbiz.com');
      expect(SUPER_ADMIN_EMAILS).toContain('camila@blumenbiz.com');
      expect(SUPER_ADMIN_EMAILS).toHaveLength(3);
    });

    it('should have correct admin domains', () => {
      expect(ADMIN_EMAIL_DOMAINS).toContain('dataro-it.com.br');
      expect(ADMIN_EMAIL_DOMAINS).toHaveLength(1);
    });
  });
});
