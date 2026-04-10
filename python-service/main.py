"""
API FastAPI — Blumen Vision Python Processor
Recebe uploads de planilhas (CSV/XLSX), processa com pandas e enriquece via Vertex AI.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from processor import processar_planilha
from vertex_ai import gerar_relatorio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("blumen-processor")

SPREADSHEET_EXTS = {"csv", "xlsx", "xls"}
MAX_SIZE_BYTES = 32 * 1024 * 1024  # 32 MB


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Blumen Vision Python Processor iniciado.")
    yield
    logger.info("Blumen Vision Python Processor encerrado.")


app = FastAPI(
    title="Blumen Vision — Python Processor",
    description="Processamento de planilhas financeiras com pandas + Vertex AI",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
def health():
    """Endpoint de health-check para o Cloud Run."""
    return {"status": "ok"}


@app.post("/process")
async def process_spreadsheet(
    file: UploadFile = File(...),
    gerar_relatorio_ia: bool = True,
):
    """
    Recebe uma planilha (CSV, XLSX ou XLS), processa com pandas e opcionalmente
    enriquece a análise com Vertex AI.

    Parâmetros:
    - **file**: arquivo da planilha (multipart/form-data)
    - **gerar_relatorio_ia**: se True, chama o Vertex AI para gerar o relatório analítico
    """
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in SPREADSHEET_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato .{ext} não suportado. Use: {', '.join(SPREADSHEET_EXTS)}",
        )

    conteudo = await file.read()
    if len(conteudo) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Arquivo muito grande. Máximo 32 MB.")
    if len(conteudo) == 0:
        raise HTTPException(status_code=400, detail="Arquivo vazio.")

    logger.info("Processando arquivo: %s (%d bytes)", file.filename, len(conteudo))

    try:
        resultado = processar_planilha(conteudo, file.filename or "arquivo.csv")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Erro inesperado ao processar planilha")
        raise HTTPException(status_code=500, detail="Erro interno ao processar planilha.") from exc

    relatorio_texto: str | None = None
    if gerar_relatorio_ia:
        try:
            relatorio_texto = gerar_relatorio(resultado)
        except Exception as exc:
            logger.warning("Vertex AI indisponível: %s", exc)
            relatorio_texto = None

    return JSONResponse(
        content={
            "ok": True,
            "row_count": len(resultado["rows"]),
            "columns": resultado["columns"],
            "colunas_originais": resultado["colunas_originais"],
            "mapeamento_realizado": resultado["mapeamento_realizado"],
            "layout_camila_detectado": resultado["layout_camila_detectado"],
            "resumo": resultado["resumo"],
            "analise_por_status": resultado["analise_por_status"],
            "relatorio_ia": relatorio_texto,
            "rows": resultado["rows"],
            "source": "pandas_vertex",
        }
    )
