'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-destructive mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>500</h1>
        <p className="text-lg text-muted-foreground mb-6">Ocorreu um erro inesperado</p>
        <button
          onClick={reset}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
