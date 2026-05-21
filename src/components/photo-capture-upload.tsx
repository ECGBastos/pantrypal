"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, ImagePlus, Loader2, Wand2 } from "lucide-react";
import type { Category } from "@prisma/client";
import { ConfirmCancelActions } from "@/components/confirm-cancel-actions";
import { DetectedItemReview, type ReviewInventoryItem } from "@/components/detected-item-review";
import { ErrorState } from "@/components/error-state";
import { PhotoPreview } from "@/components/photo-preview";

type DetectedResponseItem = {
  name: string;
  category: string;
  confidence: number;
  suggestedQuantity?: number | null;
  suggestedUnit?: string | null;
  suggestedLocation?: string | null;
  matchedExistingInventoryItemId?: string | null;
};

export function PhotoCaptureUpload({
  categories,
  saveAction
}: {
  categories: Pick<Category, "id" | "name">[];
  saveAction: (formData: FormData) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [items, setItems] = useState<ReviewInventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "analyzing" | "review" | "fallback">("idle");
  const [isSaving, startSaving] = useTransition();

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const serializedItems = useMemo(() => JSON.stringify(items), [items]);

  function clearPhoto() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    setObjectUrl(null);
    setFile(null);
    setItems([]);
    setError(null);
    setStatus("idle");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.currentTarget.files?.[0] ?? null;
    if (!nextFile) {
      clearPhoto();
      return;
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    // Privacy guardrail: object URLs are preview-only browser memory references.
    // They are revoked on cancel, replacement, and unmount.
    const nextObjectUrl = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setObjectUrl(nextObjectUrl);
    setItems([]);
    setError(null);
    setStatus("ready");
  }

  async function analyzePhoto() {
    if (!file) {
      return;
    }

    setStatus("analyzing");
    setError(null);

    const formData = new FormData();
    // The image is sent as a temporary request payload only; the server route is
    // required not to persist it.
    formData.append("image", file);

    try {
      const response = await fetch("/api/photo-analysis", {
        method: "POST",
        body: formData
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Não foi possível analisar a foto.");
      }

      const detectedItems = (payload.items ?? []) as DetectedResponseItem[];
      setItems(
        detectedItems.map((item) => ({
          id: crypto.randomUUID(),
          selected: true,
          name: item.name,
          category: item.category || "Outro",
          confidence: item.confidence,
          quantity: item.suggestedQuantity ?? 1,
          unit: item.suggestedUnit ?? "",
          location: item.suggestedLocation ?? "",
          note: "",
          matchedExistingInventoryItemId: item.matchedExistingInventoryItemId ?? null
        }))
      );
      setStatus("review");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não conseguimos detetar artigos automaticamente. Ainda podes adicioná-los manualmente a partir desta foto.");
      setItems([
        {
          id: crypto.randomUUID(),
          selected: true,
          name: "",
          category: "Outro",
          confidence: 0,
          quantity: 1,
          unit: "",
          location: "",
          note: ""
        }
      ]);
      setStatus("fallback");
    }
  }

  return (
    <div className="scan-frame">
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur">
        <div className="mobile-shell content-pad flex items-center justify-between py-4">
          <Link href="/inventory" className="flex min-h-12 items-center gap-2 text-sm font-bold text-on-surface-variant">
            <ArrowLeft size={24} aria-hidden="true" />
            Voltar
          </Link>
          <h1 className="text-xl font-bold text-primary">Rever artigos</h1>
          <button type="button" className="icon-button" onClick={clearPhoto} aria-label="Limpar foto">
            <Camera size={23} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="mobile-shell content-pad space-y-6 pb-8 pt-4">
        <section className="paper-card space-y-4 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
              <ImagePlus size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Fotografar stock</h2>
              <p className="mt-1 text-sm leading-6 text-outline">
                Tira uma foto da despensa, frigorífico ou armário. A foto não é guardada; só os artigos confirmados ficam registados.
              </p>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFileChange}
            className="block w-full rounded-xl bg-surface-container-low p-3 text-sm"
          />

          <p className="text-xs leading-5 text-outline">
            Se a câmara não estiver disponível, podes escolher uma imagem da galeria.
          </p>
        </section>

        {objectUrl ? <PhotoPreview objectUrl={objectUrl} /> : null}

        {error ? <ErrorState message={error} /> : null}

        {status === "ready" ? (
          <button type="button" className="primary-button w-full" onClick={analyzePhoto}>
            <Wand2 size={20} aria-hidden="true" />
            Analisar foto
          </button>
        ) : null}

        {status === "analyzing" ? (
          <div className="paper-card flex items-center justify-center gap-3 p-5 text-primary">
            <Loader2 className="animate-spin" size={22} aria-hidden="true" />
            <span className="font-bold">A procurar artigos prováveis</span>
          </div>
        ) : null}

        {status === "review" || status === "fallback" ? (
          <form
            action={(formData) => {
              startSaving(() => saveAction(formData));
            }}
            className="space-y-5"
          >
            <section>
              <h2 className="text-2xl font-bold text-on-surface">Artigos detetados</h2>
              <p className="mt-1 text-base leading-7 text-on-surface-variant">
                Confirma, corrige ou descarta cada sugestão antes de guardar.
              </p>
            </section>
            <DetectedItemReview categories={categories} items={items} onChange={setItems} />
            <input type="hidden" name="items" value={serializedItems} />
            <ConfirmCancelActions confirmLabel={isSaving ? "A guardar..." : "Guardar no stock"} cancelHref="/inventory" disabled={isSaving || !items.some((item) => item.selected && item.name.trim())} />
          </form>
        ) : null}
      </main>
    </div>
  );
}
