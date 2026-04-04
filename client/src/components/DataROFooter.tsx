/**
 * DataROFooter — Rodapé "Desenvolvido por DATA-RO Inteligência Territorial"
 * 
 * Logo com container de cantos arredondados + efeito brilhoso (glossy shine)
 * Link para www.dataro-it.com.br
 */

const DATARO_LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663350656007/Rv4q3kESEs5MJJSPdvwvcq/LOGODATA-RO_a0df37e4.jpeg";

interface DataROFooterProps {
  /** Variante de fundo: 'light' para páginas claras, 'dark' para sidebar/seções escuras */
  variant?: "light" | "dark";
}

export default function DataROFooter({ variant = "light" }: DataROFooterProps) {
  const isDark = variant === "dark";

  return (
    <div className={`py-6 ${isDark ? "" : "border-t border-border/40"}`}>
      <div className="flex flex-col items-center gap-3">
        {/* Logo com container de cantos arredondados e efeito brilhoso */}
        <a
          href="https://www.dataro-it.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-block"
          title="Visite o site da DATA-RO Inteligência Territorial"
        >
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
            {/* Imagem da logo */}
            <img
              src={DATARO_LOGO_URL}
              alt="DATA-RO Inteligência Territorial"
              className="w-full h-full object-cover"
            />
            {/* Efeito brilhoso (glossy shine overlay) */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.15) 100%)",
              }}
            />
            {/* Shine sweep animation on hover */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
            >
              <div
                className="absolute -inset-full opacity-0 group-hover:opacity-100 group-hover:animate-shine"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                  transform: "skewX(-20deg)",
                }}
              />
            </div>
          </div>
        </a>

        {/* Texto */}
        <p className={`text-[11px] font-medium tracking-wide ${
          isDark ? "text-white/40" : "text-muted-foreground/60"
        }`}>
          Desenvolvido por{" "}
          <a
            href="https://www.dataro-it.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className={`font-bold hover:underline transition-colors ${
              isDark
                ? "text-white/60 hover:text-white/80"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            DATA-RO Inteligência Territorial
          </a>
        </p>
      </div>
    </div>
  );
}
