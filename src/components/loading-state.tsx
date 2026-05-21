export function LoadingState({ label = "A carregar" }: { label?: string }) {
  return (
    <div className="paper-card flex min-h-32 items-center justify-center gap-3 p-5 text-outline">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}
