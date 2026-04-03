"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface UploadResult {
  filename: string;
  status: "success" | "error" | "processing";
  message?: string;
}

export default function UploadsPage() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      setResults((prev) => [...prev, { filename: file.name, status: "processing" }]);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Erro no upload");
        const data = await res.json();

        setResults((prev) =>
          prev.map((r) =>
            r.filename === file.name
              ? { ...r, status: "success", message: data.message || "Upload concluído" }
              : r
          )
        );
      } catch (err) {
        setResults((prev) =>
          prev.map((r) =>
            r.filename === file.name
              ? { ...r, status: "error", message: "Falha no upload" }
              : r
          )
        );
      }
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Upload className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-serif">Upload de Planilhas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envie planilhas Excel ou CSV para análise automatizada
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <FileSpreadsheet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm font-medium">
          Arraste planilhas aqui ou{" "}
          <label className="text-primary cursor-pointer hover:underline">
            selecione arquivos
            <input
              type="file"
              multiple
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Formatos aceitos: .xlsx, .xls, .csv (máximo 16MB)
        </p>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Arquivos Enviados</h2>
          </div>
          <div className="divide-y divide-border">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                {r.status === "processing" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                {r.status === "success" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                {r.status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.filename}</p>
                  {r.message && <p className="text-xs text-muted-foreground">{r.message}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
