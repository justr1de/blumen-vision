"""
Módulo de integração com Vertex AI (Gemini).
Recebe o resultado do processamento pandas e gera o relatório analítico
definido nas Etapas 4 e 5 do VERTEX_AI_SYSTEM_CONTEXT.md.
"""

import json
import os

import vertexai
from vertexai.generative_models import GenerativeModel

# ─────────────────────────────────────────────────────────────────────────────
# Configuração
# ─────────────────────────────────────────────────────────────────────────────

_PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "")
_LOCATION = os.environ.get("VERTEX_AI_LOCATION", "us-central1")
_MODEL_ID = os.environ.get("VERTEX_AI_MODEL", "gemini-2.5-flash-preview-04-17")

# Instrução de sistema conforme VERTEX_AI_SYSTEM_CONTEXT.md
_SYSTEM_INSTRUCTION = """
Você é o cérebro analítico do sistema Blumen Vision, uma plataforma de gestão financeira \
e operacional criada para a empresa da Camila Arnuti. Seu papel é analisar dados de planilhas \
financeiras (crédito consignado, promotora de crédito e gestão de caixa multi-unidade) já \
processados pelo módulo pandas e gerar relatórios executivos detalhados em Português Brasileiro.

Quando receber um JSON com os dados processados, gere EXATAMENTE os seguintes blocos de resultado:

──────────────────────────────────────
BLOCO 1: RESUMO EXECUTIVO
──────────────────────────────────────
- Total de registros processados
- Total de registros válidos vs. com alertas
- Colunas detectadas e mapeamento realizado
- Layout Camila detectado: SIM/NÃO
- Período dos dados (data mais antiga → mais recente)
- Volume financeiro total (soma de valor_principal) em R$
- Ticket médio por operação em R$

──────────────────────────────────────
BLOCO 2: ANÁLISE POR STATUS
──────────────────────────────────────
Tabela Markdown:
| Status | Qtd | Valor Total (R$) | % do Volume |

──────────────────────────────────────
BLOCO 3: ALERTAS E INCONSISTÊNCIAS
──────────────────────────────────────
Liste problemas encontrados: CPFs inválidos, valores zerados, datas inválidas.

──────────────────────────────────────
BLOCO 4: RECOMENDAÇÕES OPERACIONAIS
──────────────────────────────────────
Insights práticos sobre os dados para a gestão da empresa.

Responda SEMPRE em Português Brasileiro. Valores monetários no formato R$ 0.000,00.
Não repita os dados brutos — apenas os blocos de análise acima.
"""


def _inicializar_vertex() -> bool:
    """Inicializa o Vertex AI SDK. Retorna False se PROJECT_ID não estiver definido."""
    if not _PROJECT_ID:
        return False
    vertexai.init(project=_PROJECT_ID, location=_LOCATION)
    return True


def gerar_relatorio(resultado_pandas: dict) -> str:
    """
    Recebe o dict retornado por processor.processar_planilha() e chama o Vertex AI
    para gerar os blocos de relatório. Retorna o texto do relatório ou uma string
    de fallback se o Vertex AI não estiver disponível.
    """
    if not _inicializar_vertex():
        return _relatorio_fallback(resultado_pandas)

    # Monta o payload para o modelo — só envia o resumo + análise (não os rows brutos)
    payload = {
        "resumo": resultado_pandas.get("resumo", {}),
        "analise_por_status": resultado_pandas.get("analise_por_status", []),
        "colunas_detectadas": resultado_pandas.get("columns", []),
        "mapeamento_realizado": resultado_pandas.get("mapeamento_realizado", {}),
        "layout_camila_detectado": resultado_pandas.get("layout_camila_detectado", False),
        "total_rows": len(resultado_pandas.get("rows", [])),
    }

    prompt = (
        "Analise os dados processados abaixo e gere o relatório completo com os 4 blocos solicitados:\n\n"
        f"```json\n{json.dumps(payload, ensure_ascii=False, indent=2)}\n```"
    )

    try:
        model = GenerativeModel(
            _MODEL_ID,
            system_instruction=_SYSTEM_INSTRUCTION,
        )
        response = model.generate_content(
            prompt,
            generation_config={"temperature": 0.2, "max_output_tokens": 4096},
        )
        return response.text
    except Exception as exc:
        return f"[Vertex AI indisponível: {exc}]\n\n{_relatorio_fallback(resultado_pandas)}"


def _relatorio_fallback(resultado: dict) -> str:
    """Gera um relatório básico em texto sem chamar o Vertex AI."""
    r = resultado.get("resumo", {})
    linhas = [
        "── RESUMO EXECUTIVO (gerado localmente) ──",
        f"Total de registros: {r.get('total_registros', 0)}",
        f"Registros válidos: {r.get('registros_validos', 0)}",
        f"Registros com alertas: {r.get('registros_com_alertas', 0)}",
        f"Layout Camila detectado: {'SIM' if resultado.get('layout_camila_detectado') else 'NÃO'}",
        f"Período: {r.get('periodo_inicio', 'N/A')} → {r.get('periodo_fim', 'N/A')}",
    ]
    if r.get("volume_total_brl") is not None:
        linhas.append(f"Volume total: R$ {r['volume_total_brl']:,.2f}")
    if r.get("ticket_medio_brl") is not None:
        linhas.append(f"Ticket médio: R$ {r['ticket_medio_brl']:,.2f}")

    analise = resultado.get("analise_por_status", [])
    if analise:
        linhas.append("\n── ANÁLISE POR STATUS ──")
        linhas.append("| Status | Qtd | Valor Total (R$) | % do Volume |")
        linhas.append("|--------|-----|-----------------|-------------|")
        for item in analise:
            linhas.append(
                f"| {item['status']} | {item['quantidade']} "
                f"| R$ {item['valor_total']:,.2f} | {item['percentual']}% |"
            )

    return "\n".join(linhas)
