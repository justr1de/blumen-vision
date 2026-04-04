import type { Metadata } from "next";
import { headers } from "next/headers";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Blumen Vision — Inteligência Financeira",
  description: "Plataforma de auditoria contábil, conciliação de empréstimos e geração de BIs gerenciais com Gemini AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Force dynamic rendering by reading headers
  headers();
  
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
