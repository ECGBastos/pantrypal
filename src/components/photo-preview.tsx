import { Info } from "lucide-react";

export function PhotoPreview({ objectUrl }: { objectUrl: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-4 border-white shadow-[0_15px_35px_-5px_rgba(0,0,0,0.08)]">
      {/* This object URL points at browser memory only and is revoked by the capture flow. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={objectUrl} alt="Temporary inventory preview" className="h-full w-full object-cover" />
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/45 to-transparent p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <Info size={16} aria-hidden="true" />
          Photos are processed temporarily and never stored.
        </p>
      </div>
    </div>
  );
}
