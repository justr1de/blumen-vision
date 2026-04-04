/**
 * RequireAuth — Componente wrapper que protege rotas por autenticação e role
 * 
 * Uso:
 *   <RequireAuth>...</RequireAuth>                    → qualquer usuário autenticado
 *   <RequireAuth role="admin">...</RequireAuth>       → admin ou super_admin
 *   <RequireAuth role="super_admin">...</RequireAuth> → apenas super_admin
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Loader2, ShieldAlert, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

type UserRole = "user" | "admin" | "super_admin";

interface RequireAuthProps {
  children: React.ReactNode;
  role?: UserRole;
  fallback?: React.ReactNode;
}

function isRoleAuthorized(userRole: string, requiredRole: UserRole): boolean {
  if (requiredRole === "user") return true;
  if (requiredRole === "admin") return userRole === "admin" || userRole === "super_admin";
  if (requiredRole === "super_admin") return userRole === "super_admin";
  return false;
}

export default function RequireAuth({ children, role = "user", fallback }: RequireAuthProps) {
  const { user, loading, isAuthenticated } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blumen-navy mx-auto" />
          <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="p-4 rounded-2xl bg-blumen-navy/5 inline-block mx-auto">
            <LogIn className="w-12 h-12 text-blumen-navy" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Acesso Restrito</h2>
            <p className="text-sm text-muted-foreground">
              Você precisa estar autenticado para acessar esta área.
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            className="bg-blumen-navy hover:bg-blumen-navy/90 text-white gap-2"
          >
            <LogIn className="w-4 h-4" />
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated but insufficient role
  if (!isRoleAuthorized(user.role, role)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="p-4 rounded-2xl bg-destructive/5 inline-block mx-auto">
            <ShieldAlert className="w-12 h-12 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Acesso Negado</h2>
            <p className="text-sm text-muted-foreground">
              Você não possui permissão para acessar esta área.
              {role === "admin" && " Apenas administradores podem acessar o painel de gestão."}
              {role === "super_admin" && " Apenas super administradores podem acessar esta funcionalidade."}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => { window.location.href = "/"; }}
            className="gap-2"
          >
            Voltar à Página Inicial
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
