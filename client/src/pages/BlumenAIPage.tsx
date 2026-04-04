/**
 * BlumenAI — Assistente Financeiro Inteligente
 * Chat com IA + Upload e análise de PDFs
 */
import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FileUp,
  Sparkles,
  FileText,
  Brain,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Streamdown } from "streamdown";

const SUGGESTED_PROMPTS = [
  "Explique a estrutura de um DRE gerencial",
  "Como identificar cobranças indevidas em empréstimos?",
  "Quais são as principais contas de um plano contábil?",
  "Como conciliar lançamentos entre sistemas diferentes?",
];

type PdfFile = {
  name: string;
  base64: string;
  size: number;
};

export default function BlumenAIPage() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);

  // PDF analysis state
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [pdfPrompt, setPdfPrompt] = useState("");
  const [pdfResult, setPdfResult] = useState<string | null>(null);
  const [extractionType, setExtractionType] = useState("generico");
  const [structuredResult, setStructuredResult] = useState<unknown>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Erro ao processar: ${error.message}`,
        },
      ]);
    },
  });

  const pdfMutation = trpc.ai.analyzePdf.useMutation({
    onSuccess: (data) => {
      setPdfResult(data.response);
    },
    onError: (error) => {
      setPdfResult(`Erro ao analisar PDF: ${error.message}`);
    },
  });

  const structuredMutation = trpc.ai.analyzeStructured.useMutation({
    onSuccess: (data) => {
      setStructuredResult(data.data);
    },
    onError: (error) => {
      setStructuredResult({
        error: `Erro na extração: ${error.message}`,
      });
    },
  });

  // Chat handler
  const handleSendMessage = useCallback(
    (content: string) => {
      const newMessages: Message[] = [
        ...messages,
        { role: "user", content },
      ];
      setMessages(newMessages);
      chatMutation.mutate({ messages: newMessages });
    },
    [messages, chatMutation]
  );

  // File upload handler
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 16 * 1024 * 1024) {
        setPdfResult("Arquivo muito grande. O limite é 16MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        setPdfFile({
          name: file.name,
          base64,
          size: file.size,
        });
        setPdfResult(null);
        setStructuredResult(null);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  // PDF analysis handler
  const handleAnalyzePdf = useCallback(() => {
    if (!pdfFile) return;
    pdfMutation.mutate({
      fileBase64: pdfFile.base64,
      fileName: pdfFile.name,
      prompt: pdfPrompt || undefined,
    });
  }, [pdfFile, pdfPrompt, pdfMutation]);

  // Structured extraction handler
  const handleExtractStructured = useCallback(() => {
    if (!pdfFile) return;
    structuredMutation.mutate({
      fileBase64: pdfFile.base64,
      fileName: pdfFile.name,
      extractionType: extractionType as
        | "dre"
        | "extrato"
        | "contrato"
        | "balancete"
        | "generico",
    });
  }, [pdfFile, extractionType, structuredMutation]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blumen-navy/10 to-blumen-olive/10 border border-blumen-navy/20">
          <Brain className="w-6 h-6 text-blumen-navy" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold"
            
          >
            Blumen AI
          </h1>
          <p className="text-xs text-muted-foreground">
            Assistente financeiro inteligente com Gemini
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="chat" className="gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Chat Financeiro
          </TabsTrigger>
          <TabsTrigger value="pdf" className="gap-2">
            <FileText className="w-3.5 h-3.5" />
            Análise de PDF
          </TabsTrigger>
          <TabsTrigger value="extract" className="gap-2">
            <FileUp className="w-3.5 h-3.5" />
            Extração Estruturada
          </TabsTrigger>
        </TabsList>

        {/* TAB: Chat Financeiro */}
        <TabsContent value="chat">
          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={chatMutation.isPending}
            placeholder="Pergunte sobre DRE, conciliação, empréstimos..."
            height="calc(100vh - 280px)"
            emptyStateMessage="Converse com o Blumen AI sobre finanças"
            suggestedPrompts={SUGGESTED_PROMPTS}
          />
        </TabsContent>

        {/* TAB: Análise de PDF */}
        <TabsContent value="pdf">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3
                  className="text-lg font-semibold"
                  
                >
                  Upload de Documento
                </h3>

                {/* Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-blumen-navy/50 hover:bg-blumen-navy/5 transition-all duration-300"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Clique ou arraste um arquivo PDF
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Máximo 16MB
                  </p>
                </div>

                {/* Selected File */}
                <AnimatePresence>
                  {pdfFile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 bg-muted/50 rounded-lg p-3"
                    >
                      <FileText className="w-5 h-5 text-blumen-navy shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {pdfFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(pdfFile.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfFile(null);
                          setPdfResult(null);
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Custom Prompt */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Instrução personalizada (opcional)
                  </label>
                  <Textarea
                    value={pdfPrompt}
                    onChange={(e) => setPdfPrompt(e.target.value)}
                    placeholder="Ex: Identifique todas as taxas de juros mencionadas neste contrato..."
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>

                {/* Analyze Button */}
                <Button
                  onClick={handleAnalyzePdf}
                  disabled={!pdfFile || pdfMutation.isPending}
                  className="w-full gap-2 bg-blumen-navy hover:bg-blumen-navy/90 text-white"
                >
                  {pdfMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analisando com Gemini...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Analisar Documento
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Area */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3
                  className="text-lg font-semibold mb-4"
                  
                >
                  Resultado da Análise
                </h3>

                {pdfMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-3" />
                    <p className="text-sm">Processando documento...</p>
                    <p className="text-xs mt-1">
                      Isso pode levar alguns segundos
                    </p>
                  </div>
                ) : pdfResult ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none max-h-[calc(100vh-400px)] overflow-y-auto">
                    <Streamdown>{pdfResult}</Streamdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
                    <FileText className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">
                      Faça upload de um PDF para ver a análise
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: Extração Estruturada */}
        <TabsContent value="extract">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Config Area */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3
                  className="text-lg font-semibold"
                  
                >
                  Extração de Dados
                </h3>
                <p className="text-xs text-muted-foreground">
                  Extraia dados estruturados (JSON) de documentos financeiros
                  para importação no sistema.
                </p>

                {/* Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-blumen-navy/50 hover:bg-blumen-navy/5 transition-all duration-300"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {pdfFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blumen-olive" />
                      <span className="text-sm font-medium">
                        {pdfFile.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(pdfFile.size)})
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Selecione um PDF
                      </p>
                    </>
                  )}
                </div>

                {/* Extraction Type */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipo de Documento
                  </label>
                  <Select
                    value={extractionType}
                    onValueChange={setExtractionType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dre">
                        DRE — Demonstrativo de Resultado
                      </SelectItem>
                      <SelectItem value="extrato">
                        Extrato Bancário
                      </SelectItem>
                      <SelectItem value="contrato">
                        Contrato / Acordo
                      </SelectItem>
                      <SelectItem value="balancete">
                        Balancete Contábil
                      </SelectItem>
                      <SelectItem value="generico">
                        Detecção Automática
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Extract Button */}
                <Button
                  onClick={handleExtractStructured}
                  disabled={!pdfFile || structuredMutation.isPending}
                  className="w-full gap-2 bg-blumen-olive hover:bg-blumen-olive/90 text-white"
                >
                  {structuredMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extraindo dados...
                    </>
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      Extrair Dados Estruturados
                    </>
                  )}
                </Button>

                {structuredMutation.isError && (
                  <div className="flex items-center gap-2 text-destructive text-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Erro na extração. Tente novamente.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Structured Results */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3
                  className="text-lg font-semibold mb-4"
                  
                >
                  Dados Extraídos
                </h3>

                {structuredMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-3" />
                    <p className="text-sm">Extraindo dados estruturados...</p>
                  </div>
                ) : structuredResult ? (
                  <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                    <pre className="text-xs font-mono bg-muted/50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(structuredResult, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
                    <Brain className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">
                      Selecione um PDF e o tipo de extração
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
