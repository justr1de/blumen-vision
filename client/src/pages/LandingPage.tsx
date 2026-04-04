/**
 * LandingPage — Página pública da Blumen Biz
 * Sem autenticação, apresenta a marca e direciona para login
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BlumenSymbol from "@/components/BlumenSymbol";
import DataROFooter from "@/components/DataROFooter";
import {
  BarChart3,
  Shield,
  Brain,
  ArrowRight,
  LogIn,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

const heroImg = "https://d2xsxph8kpxj0f.cloudfront.net/310519663350656007/Rv4q3kESEs5MJJSPdvwvcq/hero-banner-Yi8YEE6cCTpZfssKciLWV7.webp";

const features = [
  {
    icon: BarChart3,
    title: "Dashboards Gerenciais",
    description: "Visualize DRE, fluxo de caixa, evolução mensal e indicadores financeiros em tempo real.",
  },
  {
    icon: Shield,
    title: "Auditoria de Empréstimos",
    description: "Identifique cobranças indevidas, erros de lançamento e incongruências entre financeira e banco.",
  },
  {
    icon: Brain,
    title: "Blumen AI",
    description: "Assistente inteligente com Gemini para análise de documentos financeiros e consultas contábeis.",
  },
];

export default function LandingPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BlumenSymbol size={36} variant="light-bg" />
            <div className="leading-tight">
              <span className="text-lg font-extrabold text-blumen-navy tracking-tight">
                blúmen<span className="text-blumen-olive"> biz</span><span className="text-blumen-olive text-[8px] align-super ml-0.5">™</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-blumen-navy/20 text-blumen-navy hover:bg-blumen-navy/5"
                    onClick={() => setLocation("/gestao")}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Gestão
                  </Button>
                )}
                <Button
                  size="sm"
                  className="gap-2 bg-blumen-navy hover:bg-blumen-navy/90 text-white"
                  onClick={() => setLocation("/painel")}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Meu Painel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                className="gap-2 bg-blumen-navy hover:bg-blumen-navy/90 text-white"
                onClick={() => { window.location.href = getLoginUrl(); }}
              >
                <LogIn className="w-3.5 h-3.5" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16">
        <div className="relative h-[420px] sm:h-[500px] overflow-hidden">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-blumen-navy/95 via-blumen-navy/70 to-blumen-navy/30" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="max-w-xl"
              >
                <p className="text-blumen-olive font-semibold text-sm uppercase tracking-widest mb-3">
                  Clareza para negócios
                </p>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                  Inteligência financeira para decisões seguras
                </h1>
                <p className="text-white/70 text-base sm:text-lg mb-6 leading-relaxed">
                  Plataforma de auditoria e análise financeira que identifica erros, calcula incongruências e apresenta resultados claros sobre empréstimos e operações financeiras.
                </p>
                <div className="flex flex-wrap gap-3">
                  {isAuthenticated ? (
                    <Button
                      size="lg"
                      className="gap-2 bg-blumen-olive hover:bg-blumen-olive/90 text-white font-semibold"
                      onClick={() => setLocation(isAdmin ? "/gestao" : "/painel")}
                    >
                      Acessar Painel
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="gap-2 bg-blumen-olive hover:bg-blumen-olive/90 text-white font-semibold"
                      onClick={() => { window.location.href = getLoginUrl(); }}
                    >
                      Começar Agora
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Ferramentas para auditoria financeira
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transforme planilhas complexas em dashboards gerenciais claros e identifique automaticamente erros e incongruências nos lançamentos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-xl bg-blumen-navy/5 inline-block mb-4">
                      <feature.icon className="w-6 h-6 text-blumen-navy" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Section */}
      <section className="py-16 bg-blumen-navy">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <BlumenSymbol size={56} variant="dark-bg" />
            <h3 className="text-xl font-bold text-white mt-4">
              Camila Arnuti
            </h3>
            <p className="text-blumen-olive font-medium text-sm mt-1">
              Palestras e Cursos
            </p>
            <p className="text-white/50 text-xs mt-4 italic">
              Clareza para negócios
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blumen-navy">
                blúmen<span className="text-blumen-olive"> biz</span>
              </span>
              <span className="text-xs text-muted-foreground">
                — Portal Financeiro
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().getFullYear()} Blumen Biz. Todos os direitos reservados.
            </p>
          </div>
          {/* Rodapé DATA-RO */}
          <DataROFooter variant="light" />
        </div>
      </footer>
    </div>
  );
}
