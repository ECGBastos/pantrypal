import Link from "next/link";
import { Camera, UserRound } from "lucide-react";

export function TopAppBar({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur">
      <div className="mobile-shell content-pad flex items-center justify-between py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container text-on-primary-container ring-2 ring-primary/10">
            <UserRound size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[32px] font-bold leading-10 text-primary">PantryPal</h1>
            <p className="-mt-1 text-xs font-semibold text-outline">{userName}</p>
          </div>
        </div>
        <Link href="/inventory/scan" className="icon-button" aria-label="Scan stock">
          <Camera size={26} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
