import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ClientProvider } from "./contexts/ClientContext";
import RequireAuth from "./components/RequireAuth";
import Layout from "./components/Layout";

// Páginas do painel de gestão (admin/super_admin)
import Home from "./pages/Home";
import DREPage from "./pages/DREPage";
import MovimentoPage from "./pages/MovimentoPage";
import PlanoContasPage from "./pages/PlanoContasPage";
import CrediarioPage from "./pages/CrediarioPage";
import PatrimonialPage from "./pages/PatrimonialPage";
import BlumenAIPage from "./pages/BlumenAIPage";

// Landing page pública
import LandingPage from "./pages/LandingPage";

// Páginas de autenticação
import LoginPage from "./pages/LoginPage";
import RegistroPage from "./pages/RegistroPage";

/**
 * Rotas do Painel de Gestão — protegidas por role admin/super_admin
 * Acessível apenas por: contato@dataro-it.com.br, anderson@blumenbiz.com, camila@blumenbiz.com
 * e qualquer email @dataro-it.com.br
 */
function AdminPanel() {
  return (
    <RequireAuth role="admin">
      <ClientProvider>
        <Layout>
          <Switch>
            <Route path="/gestao" component={Home} />
            <Route path="/gestao/dre" component={DREPage} />
            <Route path="/gestao/movimento" component={MovimentoPage} />
            <Route path="/gestao/plano-contas" component={PlanoContasPage} />
            <Route path="/gestao/crediario" component={CrediarioPage} />
            <Route path="/gestao/patrimonial" component={PatrimonialPage} />
            <Route path="/gestao/blumen-ai" component={BlumenAIPage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </ClientProvider>
    </RequireAuth>
  );
}

/**
 * Rotas do Painel do Usuário — protegidas por autenticação simples
 * Acessível por qualquer usuário autenticado (clientes)
 */
function UserPanel() {
  return (
    <RequireAuth>
      <ClientProvider>
        <Layout>
          <Switch>
            <Route path="/painel" component={Home} />
            <Route path="/painel/dre" component={DREPage} />
            <Route path="/painel/movimento" component={MovimentoPage} />
            <Route path="/painel/plano-contas" component={PlanoContasPage} />
            <Route path="/painel/crediario" component={CrediarioPage} />
            <Route path="/painel/patrimonial" component={PatrimonialPage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </ClientProvider>
    </RequireAuth>
  );
}

function Router() {
  return (
    <Switch>
      {/* Landing page pública — sem autenticação */}
      <Route path="/" component={LandingPage} />

      {/* Autenticação */}
      <Route path="/login" component={LoginPage} />
      <Route path="/registro" component={RegistroPage} />

      {/* Painel de Gestão — admin/super_admin */}
      <Route path="/gestao/:rest*" component={AdminPanel} />
      <Route path="/gestao" component={AdminPanel} />

      {/* Painel do Usuário — qualquer autenticado */}
      <Route path="/painel/:rest*" component={UserPanel} />
      <Route path="/painel" component={UserPanel} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
