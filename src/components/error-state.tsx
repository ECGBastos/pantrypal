import { AlertTriangle } from "lucide-react";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="paper-card flex items-start gap-3 border-error-container bg-error-container/30 p-4 text-sm text-error">
      <AlertTriangle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
