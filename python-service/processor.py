"""
Módulo de processamento de planilhas com pandas.
Implementa as Etapas 1–3 do Blumen Vision (leitura, mapeamento canônico,
validação e enriquecimento).
"""

import re
import unicodedata
from io import BytesIO

import pandas as pd

# ─────────────────────────────────────────────────────────────────────────────
# Dicionário canônico (todos os sinônimos → campo canônico)
# Fonte: VERTEX_AI_SYSTEM_CONTEXT.md — Etapa 2
# ─────────────────────────────────────────────────────────────────────────────
DICIONARIO_CANONICO: dict[str, str] = {
    # cpf
    "cpf": "cpf",
    "cpf_cliente": "cpf",
    "cpf_do_cliente": "cpf",
    "cpf_agente": "cpf",
    "documento": "cpf",
    "doc_cliente": "cpf",
    # nome_cliente
    "nome_cliente": "nome_cliente",
    "cliente": "nome_cliente",
    "nome": "nome_cliente",
    "nome_do_cliente": "nome_cliente",
    "nome_completo": "nome_cliente",
    "beneficiario": "nome_cliente",
    "nome_do_beneficiario": "nome_cliente",
    # contrato
    "contrato": "contrato",
    "numero_contrato": "contrato",
    "nro_contrato": "contrato",
    "num_contrato": "contrato",
    "numero_operacao": "contrato",
    "numero_operacao_bmg": "contrato",
    "numero_da_operacao_no_bmg": "contrato",
    "cod_operacao": "contrato",
    "codigo_operacao": "contrato",
    "n_contrato": "contrato",
    # produto
    "produto": "produto",
    "nome_servico": "produto",
    "nome_do_servico": "produto",
    "tipo_servico": "produto",
    "tipo_do_servico": "produto",
    "modalidade": "produto",
    "tipo_produto": "produto",
    "descricao_produto": "produto",
    "descricao_servico": "produto",
    # status_operacao
    "status": "status_operacao",
    "status_operacao": "status_operacao",
    "status_da_operacao": "status_operacao",
    "situacao": "status_operacao",
    "situacao_operacao": "status_operacao",
    "situacao_da_operacao": "status_operacao",
    "status_contrato": "status_operacao",
    # valor_principal
    "valor_financiado": "valor_principal",
    "vlr_base": "valor_principal",
    "valor": "valor_principal",
    "valor_total": "valor_principal",
    "valor_total_emprestimo": "valor_principal",
    "valor_do_emprestimo": "valor_principal",
    "valor_liberado": "valor_principal",
    "vl_operacao": "valor_principal",
    "valor_operacao": "valor_principal",
    "valor_bruto": "valor_principal",
    # valor_parcela
    "valor_parcela": "valor_parcela",
    "vlr_parcela": "valor_parcela",
    "parcela": "valor_parcela",
    "vl_parcela": "valor_parcela",
    "valor_da_parcela": "valor_parcela",
    "prestacao": "valor_parcela",
    # prazo
    "prazo": "prazo",
    "prazo_meses": "prazo",
    "num_parcelas": "prazo",
    "numero_parcelas": "prazo",
    "qtd_parcelas": "prazo",
    "quantidade_de_parcelas": "prazo",
    "meses": "prazo",
    # taxa
    "taxa": "taxa",
    "taxa_juros": "taxa",
    "taxa_de_juros": "taxa",
    "taxa_mensal": "taxa",
    "taxa_ao_mes": "taxa",
    "juros_am": "taxa",
    "am": "taxa",
    # data_operacao
    "data_operacao": "data_operacao",
    "dt_operacao": "data_operacao",
    "data_entrada": "data_operacao",
    "data_entrada_pn": "data_operacao",
    "data_de_entrada_na_pn": "data_operacao",
    "data_cadastro": "data_operacao",
    "data_inclusao": "data_operacao",
    "data_proposta": "data_operacao",
    # data_pagamento
    "data_pagamento": "data_pagamento",
    "dt_pagamento": "data_pagamento",
    "data_de_pagamento": "data_pagamento",
    "data_liberacao": "data_pagamento",
    "data_credito": "data_pagamento",
    "data_do_pagamento": "data_pagamento",
    # data_vencimento
    "data_vencimento": "data_vencimento",
    "dt_vencimento": "data_vencimento",
    "vencimento": "data_vencimento",
    "primeiro_vencimento": "data_vencimento",
    "data_primeiro_vencimento": "data_vencimento",
    # banco
    "banco": "banco",
    "banco_pagador": "banco",
    "financeira": "banco",
    "instituicao": "banco",
    "instituicao_financeira": "banco",
    "convenio": "banco",
    "conveniada": "banco",
    # agente
    "agente": "agente",
    "corretor": "agente",
    "promotor": "agente",
    "vendedor": "agente",
    "consultor": "agente",
    "nome_agente": "agente",
    "cod_agente": "agente",
    "codigo_agente": "agente",
    # comissao
    "comissao": "comissao",
    "vl_comissao": "comissao",
    "valor_comissao": "comissao",
    "commissao": "comissao",
    "percentual_comissao": "comissao",
    "perc_comissao": "comissao",
    "tabela": "comissao",
    "tabela_comissao": "comissao",
    # matricula
    "matricula": "matricula",
    "num_matricula": "matricula",
    "matricula_servidor": "matricula",
    "matr": "matricula",
    "funcional": "matricula",
}

# Campos esperados do layout padrão da Camila
CAMPOS_CAMILA = {
    "nome_cliente", "cpf", "contrato", "produto", "valor_principal",
    "valor_parcela", "prazo", "status_operacao", "data_operacao",
    "data_pagamento", "banco", "agente", "comissao",
}

# Mapeamento de variações de status
STATUS_MAP: dict[str, str] = {
    "apr": "APROVADO", "aprov": "APROVADO", "aprovado": "APROVADO",
    "pago": "PAGO", "pg": "PAGO", "liquidado": "PAGO", "pago_bmg": "PAGO",
    "cancelado": "CANCELADO", "cancel": "CANCELADO", "canc": "CANCELADO",
    "pendente": "PENDENTE", "pend": "PENDENTE", "aguardando": "PENDENTE",
    "digitado": "DIGITADO", "digit": "DIGITADO", "dig": "DIGITADO",
    "reprovado": "REPROVADO", "reprov": "REPROVADO", "negado": "REPROVADO",
}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _normalizar_coluna(texto: str) -> str:
    """Remove acentos, espaços e caracteres especiais de um nome de coluna."""
    sem_acento = unicodedata.normalize("NFKD", str(texto)).encode("ASCII", "ignore").decode("utf-8")
    limpo = re.sub(r"[^a-zA-Z0-9]", "_", sem_acento.lower().strip())
    limpo = re.sub(r"_+", "_", limpo)
    return limpo.strip("_")


def _limpar_valor_brl(valor) -> float | None:
    """Remove R$, pontos de milhar e troca vírgula por ponto decimal."""
    if pd.isna(valor):
        return None
    s = str(valor).replace("R$", "").replace(" ", "").strip()
    # Remove ponto de milhar (ponto seguido de exatamente 3 dígitos ou antes de vírgula)
    s = re.sub(r"\.(?=\d{3}([,.]|$))", "", s)
    s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def _limpar_data(valor) -> str | None:
    """Converte datas dd/mm/yyyy ou yyyy-mm-dd para ISO (yyyy-mm-dd)."""
    if pd.isna(valor):
        return None
    s = str(valor).strip()
    m = re.match(r"(\d{2})/(\d{2})/(\d{4})", s)
    if m:
        return f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        return s[:10]
    return None


def _normalizar_status(valor) -> str | None:
    if pd.isna(valor):
        return None
    chave = str(valor).lower().strip()
    return STATUS_MAP.get(chave, str(valor).upper())


# ─────────────────────────────────────────────────────────────────────────────
# Função principal
# ─────────────────────────────────────────────────────────────────────────────

def processar_planilha(conteudo: bytes, nome_arquivo: str) -> dict:
    """
    Etapa 1 — Lê o arquivo (CSV auto-sep ou XLSX).
    Etapa 2 — Normaliza cabeçalhos e mapeia para campos canônicos.
    Etapa 3 — Valida e enriquece os dados.
    Retorna dict com rows, resumo e análise por status.
    """
    ext = nome_arquivo.rsplit(".", 1)[-1].lower() if "." in nome_arquivo else "csv"

    # Leitura
    try:
        if ext in ("xlsx", "xls"):
            df = pd.read_excel(BytesIO(conteudo), sheet_name=0, dtype=str)
        else:
            try:
                df = pd.read_csv(BytesIO(conteudo), sep=None, engine="python",
                                 encoding="utf-8-sig", dtype=str)
            except UnicodeDecodeError:
                df = pd.read_csv(BytesIO(conteudo), sep=None, engine="python",
                                 encoding="latin-1", dtype=str)
    except Exception as exc:
        raise ValueError(f"Não foi possível ler o arquivo: {exc}") from exc

    if df.empty:
        raise ValueError("Arquivo vazio ou sem dados válidos")

    colunas_originais = list(df.columns)

    # Normalização de cabeçalhos
    df.columns = [_normalizar_coluna(col) for col in df.columns]

    # Mapeamento canônico — prioriza a primeira ocorrência de cada campo canônico
    mapeamento: dict[str, str] = {}
    campos_canonicos_usados: set[str] = set()
    for col in df.columns:
        if col in DICIONARIO_CANONICO:
            canonico = DICIONARIO_CANONICO[col]
            if canonico not in campos_canonicos_usados:
                mapeamento[col] = canonico
                campos_canonicos_usados.add(canonico)

    df = df.rename(columns=mapeamento)

    # ── Validação e enriquecimento ────────────────────────────────────────────

    if "status_operacao" in df.columns:
        df["status_operacao"] = df["status_operacao"].apply(_normalizar_status)

    if "cpf" in df.columns:
        df["cpf"] = df["cpf"].astype(str).str.replace(r"\D", "", regex=True)
        df["cpf_valido"] = df["cpf"].str.match(r"^\d{11}$")

    for campo in ("valor_principal", "valor_parcela", "comissao"):
        if campo in df.columns:
            df[campo] = df[campo].apply(_limpar_valor_brl)

    for campo in ("data_operacao", "data_pagamento", "data_vencimento"):
        if campo in df.columns:
            df[campo] = df[campo].apply(_limpar_data)

    if "prazo" in df.columns:
        df["prazo"] = pd.to_numeric(df["prazo"], errors="coerce")

    # Calcular custo total quando possível
    if {"valor_parcela", "prazo", "valor_principal"}.issubset(df.columns):
        df["valor_total_pago"] = df["valor_parcela"] * df["prazo"]
        df["custo_total_financiamento"] = df["valor_total_pago"] - df["valor_principal"]

    # Estimar parcela quando ausente
    if "valor_principal" in df.columns and "prazo" in df.columns and "valor_parcela" not in df.columns:
        df["valor_parcela_estimado"] = df["valor_principal"] / df["prazo"]

    # ── Resumo executivo ──────────────────────────────────────────────────────

    total_registros = len(df)
    registros_validos = (
        int(df["cpf_valido"].sum()) if "cpf_valido" in df.columns else total_registros
    )

    volume_total: float | None = None
    ticket_medio: float | None = None
    if "valor_principal" in df.columns:
        vals = pd.to_numeric(df["valor_principal"], errors="coerce").dropna()
        if not vals.empty:
            volume_total = float(vals.sum())
            ticket_medio = float(vals.mean())

    periodo_inicio: str | None = None
    periodo_fim: str | None = None
    if "data_operacao" in df.columns:
        datas = pd.to_datetime(df["data_operacao"], errors="coerce").dropna()
        if not datas.empty:
            periodo_inicio = str(datas.min().date())
            periodo_fim = str(datas.max().date())

    # ── Análise por status ────────────────────────────────────────────────────

    analise_status: list[dict] = []
    if "status_operacao" in df.columns:
        for status, grupo in df.groupby("status_operacao", dropna=False):
            qtd = len(grupo)
            valor_grupo = 0.0
            if "valor_principal" in df.columns:
                valor_grupo = float(
                    pd.to_numeric(grupo["valor_principal"], errors="coerce").sum()
                )
            perc = (valor_grupo / volume_total * 100) if volume_total else 0.0
            analise_status.append({
                "status": str(status),
                "quantidade": qtd,
                "valor_total": round(valor_grupo, 2),
                "percentual": round(perc, 2),
            })

    # ── Detectar layout Camila ────────────────────────────────────────────────

    campos_presentes = CAMPOS_CAMILA.intersection(set(df.columns))
    layout_camila = len(campos_presentes) / len(CAMPOS_CAMILA) >= 0.6

    # ── Serializar rows para JSON ─────────────────────────────────────────────

    rows_json = df.where(pd.notna(df), None).to_dict(orient="records")

    return {
        "rows": rows_json,
        "columns": list(df.columns),
        "colunas_originais": colunas_originais,
        "mapeamento_realizado": {v: k for k, v in mapeamento.items()},
        "layout_camila_detectado": layout_camila,
        "resumo": {
            "total_registros": total_registros,
            "registros_validos": registros_validos,
            "registros_com_alertas": total_registros - registros_validos,
            "volume_total_brl": volume_total,
            "ticket_medio_brl": ticket_medio,
            "periodo_inicio": periodo_inicio,
            "periodo_fim": periodo_fim,
        },
        "analise_por_status": analise_status,
    }
