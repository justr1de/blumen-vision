# Blumen Vision — Configuração de Variáveis de Ambiente

Este documento lista todas as variáveis de ambiente necessárias para executar o sistema Blumen Vision em diferentes ambientes.

## Variáveis Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `GEMINI_API_KEY` | Chave da API Gemini para IA financeira | `AIzaSy...` |
| `DATABASE_URL` | Connection string do banco de dados | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Segredo para assinatura de tokens JWT | `random-string-64-chars` |

## Variáveis de Autenticação (Manus OAuth)

| Variável | Descrição |
|----------|-----------|
| `VITE_APP_ID` | ID da aplicação Manus OAuth |
| `OAUTH_SERVER_URL` | URL base do servidor OAuth |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login |
| `OWNER_OPEN_ID` | OpenID do proprietário |
| `OWNER_NAME` | Nome do proprietário |

## Variáveis de Interface

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `VITE_APP_TITLE` | Título do aplicativo | `Blumen Biz` |
| `VITE_APP_LOGO` | URL do logo | (vazio) |

## Variáveis do Google Cloud (Cloud Run)

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `GCP_PROJECT_ID` | ID do projeto GCP | `blumenvision` |
| `GCP_REGION` | Região do Vertex AI | `southamerica-east1` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Caminho para Service Account JSON | (produção apenas) |
| `PORT` | Porta do servidor | `8080` |

## Como Obter a Chave Gemini

1. Acesse [Google AI Studio](https://aistudio.google.com/apikey)
2. Clique em "Create API Key"
3. Selecione o projeto **BlumenVision**
4. Copie a chave gerada
