"""
Blumen Vision API — Cloud Run (FastAPI + Vertex AI / Gemini)

Este módulo implementa as mesmas funcionalidades do backend tRPC do Manus,
adaptado para rodar no Google Cloud Run com autenticação via Service Account.

Endpoints:
  POST /api/ai/chat           — Chat financeiro inteligente
  POST /api/ai/analyze-pdf    — Análise de PDFs com Gemini
  POST /api/ai/extract        — Extração estruturada de dados (JSON)
  GET  /api/ai/health         — Health check da integração

Variáveis de ambiente:
  GEMINI_API_KEY              — Chave da API Gemini (dev/staging)
  GOOGLE_APPLICATION_CREDENTIALS — Service Account JSON (produção)
  GCP_PROJECT_ID              — ID do projeto GCP (default: blumenvision)
  GCP_REGION                  — Região (default: southamerica-east1)
  GCS_BUCKET                  — Bucket para upload de PDFs
  DATABASE_URL                — Connection string do Cloud SQL
"""

import os
import json
import uuid
import base64
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

# ─── Configuração ───────────────────────────────────────────────────────────

app = FastAPI(
    title="Blumen Vision API",
    description="API de IA financeira do sistema Blumen Vision",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, restringir aos domínios do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "blumenvision")
GCP_REGION = os.getenv("GCP_REGION", "southamerica-east1")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    # Em produção no Cloud Run, usa Application Default Credentials
    genai.configure()

# Modelo padrão
MODEL_NAME = "gemini-2.5-flash"

# ─── System Prompt ──────────────────────────────────────────────────────────

SYSTEM_PROMPT = """Você é o **Blumen AI**, assistente financeiro especializado do sistema Blumen Vision.

Suas capacidades:
1. **Análise de DRE** — interpretar Demonstrativos de Resultado do Exercício, identificar tendências, margens e anomalias
2. **Conciliação financeira** — comparar lançamentos, identificar divergências entre sistemas
3. **Análise de empréstimos** — calcular juros, amortizações, saldos devedores e identificar cobranças indevidas
4. **Plano de contas** — explicar hierarquias contábeis, classificações e mapeamentos entre planos
5. **Análise de PDFs** — extrair e interpretar dados de documentos financeiros, contratos, extratos

Regras:
- Sempre responda em português brasileiro
- Use formatação Markdown para organizar as respostas
- Valores monetários devem usar o formato R$ X.XXX,XX
- Seja preciso com números — nunca arredonde sem avisar
- Quando analisar documentos, liste as descobertas em ordem de relevância
- Identifique riscos e oportunidades quando aplicável
- Se não tiver certeza sobre algo, diga explicitamente

Contexto do sistema:
- O sistema atende auditoras contábeis que analisam empréstimos e operações financeiras
- Os clientes incluem financeiras (como Grupo Imediata/BMG) e indústrias (como fábricas de tijolos)
- As planilhas seguem padrões de DRE com contas totalizadoras e de lançamento
- Há mapeamento entre planos de contas diferentes (Nasajon → Gerencial)"""

# ─── Modelos Pydantic ───────────────────────────────────────────────────────


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    response: str
    model: str


class PdfAnalysisRequest(BaseModel):
    file_base64: str
    file_name: str
    mime_type: str = "application/pdf"
    prompt: Optional[str] = None


class PdfAnalysisResponse(BaseModel):
    response: str
    file_url: Optional[str] = None


class StructuredExtractionRequest(BaseModel):
    file_base64: str
    file_name: str
    mime_type: str = "application/pdf"
    extraction_type: str = "generico"  # dre | extrato | contrato | balancete | generico


class StructuredExtractionResponse(BaseModel):
    data: dict
    file_url: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    model: str
    response: str


# ─── Helpers ────────────────────────────────────────────────────────────────


def get_model():
    """Retorna instância do modelo Gemini configurado."""
    return genai.GenerativeModel(
        model_name=MODEL_NAME,
        system_instruction=SYSTEM_PROMPT,
    )


def get_extraction_prompt(extraction_type: str) -> str:
    """Retorna o prompt de extração baseado no tipo de documento."""
    prompts = {
        "dre": (
            "Extraia todos os dados deste DRE em formato JSON com: "
            "periodo, contas (array: codigo, nome, nivel, tipo, valores_mensais, total), "
            "resumo (receita_bruta, deducoes, receita_liquida, custos, lucro_bruto, "
            "despesas_operacionais, resultado_operacional, resultado_liquido)"
        ),
        "extrato": (
            "Extraia os lançamentos deste extrato bancário em JSON com: "
            "banco, agencia, conta, periodo, "
            "lancamentos (array: data, descricao, valor, tipo, saldo), "
            "resumo (saldo_inicial, total_creditos, total_debitos, saldo_final)"
        ),
        "contrato": (
            "Extraia as informações deste contrato em JSON com: "
            "partes (array: nome, cpf_cnpj, papel), objeto, valor, prazo, "
            "condicoes (array), clausulas_relevantes (array: numero, resumo)"
        ),
        "balancete": (
            "Extraia os dados deste balancete em JSON com: "
            "periodo, empresa, "
            "contas (array: codigo, nome, saldo_anterior, debitos, creditos, saldo_atual), "
            "totais (total_debitos, total_creditos, saldo_total)"
        ),
        "generico": (
            "Extraia todas as informações relevantes deste documento financeiro "
            "em formato JSON estruturado, identificando automaticamente o tipo "
            "de documento e organizando os dados de forma hierárquica."
        ),
    }
    return prompts.get(extraction_type, prompts["generico"])


# ─── Endpoints ──────────────────────────────────────────────────────────────


@app.get("/api/ai/health", response_model=HealthResponse)
async def health_check():
    """Verifica se a integração com o Gemini está funcionando."""
    try:
        model = get_model()
        response = model.generate_content("Responda apenas: OK")
        return HealthResponse(
            status="ok",
            model=MODEL_NAME,
            response=response.text.strip(),
        )
    except Exception as e:
        return HealthResponse(
            status="error",
            model=MODEL_NAME,
            response=str(e),
        )


@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat financeiro inteligente com contexto."""
    try:
        model = get_model()
        chat_session = model.start_chat(
            history=[
                {"role": msg.role if msg.role != "assistant" else "model", "parts": [msg.content]}
                for msg in request.messages[:-1]
            ]
        )
        last_message = request.messages[-1].content if request.messages else ""
        response = chat_session.send_message(last_message)
        return ChatResponse(response=response.text, model=MODEL_NAME)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/analyze-pdf", response_model=PdfAnalysisResponse)
async def analyze_pdf(request: PdfAnalysisRequest):
    """Analisa um PDF com o Gemini."""
    try:
        model = get_model()
        file_bytes = base64.b64decode(request.file_base64)

        prompt = request.prompt or (
            "Analise este documento financeiro em detalhes. Identifique:\n"
            "1. Tipo do documento\n"
            "2. Dados-chave (valores, datas, partes envolvidas)\n"
            "3. Possíveis inconsistências\n"
            "4. Resumo executivo"
        )

        response = model.generate_content(
            [
                {"mime_type": request.mime_type, "data": file_bytes},
                prompt,
            ]
        )
        return PdfAnalysisResponse(response=response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/extract", response_model=StructuredExtractionResponse)
async def extract_structured(request: StructuredExtractionRequest):
    """Extrai dados estruturados (JSON) de um documento."""
    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=(
                f"{SYSTEM_PROMPT}\n\n"
                "IMPORTANTE: Responda EXCLUSIVAMENTE com JSON válido, "
                "sem markdown, sem blocos de código, apenas o JSON puro."
            ),
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            ),
        )
        file_bytes = base64.b64decode(request.file_base64)
        extraction_prompt = get_extraction_prompt(request.extraction_type)

        response = model.generate_content(
            [
                {"mime_type": request.mime_type, "data": file_bytes},
                extraction_prompt,
            ]
        )

        try:
            data = json.loads(response.text)
        except json.JSONDecodeError:
            data = {"raw": response.text, "error": "Não foi possível parsear o JSON"}

        return StructuredExtractionResponse(data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Startup ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
