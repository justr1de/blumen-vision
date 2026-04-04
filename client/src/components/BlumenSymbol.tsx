/**
 * BlumenSymbol — Símbolo oficial da marca blúmen biz™
 * 
 * Conforme identidade visual oficial (página 9 do manual):
 * - Letra "b" minúscula estilizada em branco (ou azul marinho em fundo claro)
 * - Haste vertical reta
 * - Barriga do "b" como arco/semicírculo aberto para a direita
 * - Pequeno círculo azul marinho na abertura da barriga
 * - 5 feixes de luz verdes (#6F963E) irradiando da abertura em formato de losango
 * 
 * Variantes:
 * - "dark-bg": símbolo branco sobre fundo azul marinho (para sidebar, seções escuras)
 * - "light-bg": símbolo azul marinho sem fundo (para header claro, landing page)
 */

interface BlumenSymbolProps {
  size?: number;
  variant?: "dark-bg" | "light-bg";
}

export default function BlumenSymbol({ size = 32, variant = "dark-bg" }: BlumenSymbolProps) {
  const hasBg = variant === "dark-bg";
  const mainColor = hasBg ? "#FFFFFF" : "#1D3B5F";
  const dotColor = hasBg ? "#1D3B5F" : "#1D3B5F";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Blumen Biz"
    >
      {/* Fundo arredondado azul marinho (apenas na variante dark-bg) */}
      {hasBg && <rect width="64" height="64" rx="14" fill="#1D3B5F" />}

      {/* Haste vertical do "b" */}
      <rect x="14" y="8" width="7" height="48" rx="1" fill={mainColor} />

      {/* Barriga do "b" — arco aberto para a direita */}
      <path
        d="M21 24 C21 24, 21 18, 30 18 C38 18, 42 24, 42 32 C42 40, 38 46, 30 46 C21 46, 21 40, 21 40"
        stroke={mainColor}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />

      {/* Círculo/ponto na abertura da barriga */}
      <circle cx="38" cy="32" r="4" fill={dotColor} />

      {/* 5 feixes de luz verdes irradiando da abertura */}
      <g fill="#6F963E">
        {/* Feixe central — horizontal */}
        <rect x="44" y="30" width="10" height="4" rx="2" />
        {/* Feixe superior 1 — ~25° */}
        <rect x="43" y="22" width="9" height="4" rx="2" transform="rotate(-25 43 24)" />
        {/* Feixe superior 2 — ~55° */}
        <rect x="40" y="14" width="8" height="4" rx="2" transform="rotate(-55 40 16)" />
        {/* Feixe inferior 1 — ~25° */}
        <rect x="43" y="38" width="9" height="4" rx="2" transform="rotate(25 43 40)" />
        {/* Feixe inferior 2 — ~55° */}
        <rect x="40" y="44" width="8" height="4" rx="2" transform="rotate(55 40 46)" />
      </g>
    </svg>
  );
}
