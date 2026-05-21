import Link from "next/link";

export function ConfirmCancelActions({
  confirmLabel,
  cancelHref,
  disabled
}: {
  confirmLabel: string;
  cancelHref: string;
  disabled?: boolean;
}) {
  return (
    <div className="fixed bottom-0 left-0 z-40 w-full bg-white/85 p-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-[0_-4px_15px_rgba(0,0,0,0.04)] backdrop-blur">
      <div className="mobile-shell flex gap-3">
        <Link href={cancelHref} className="secondary-button flex-1">
          Cancel
        </Link>
        <button className="primary-button flex-[1.4]" disabled={disabled} type="submit">
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
