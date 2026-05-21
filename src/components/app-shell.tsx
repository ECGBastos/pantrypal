import { BottomNavigation } from "@/components/bottom-navigation";
import { TopAppBar } from "@/components/top-app-bar";

export function AppShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <TopAppBar userName={userName} />
      <main className="mobile-shell content-pad space-y-7 pb-6 pt-4">{children}</main>
      <BottomNavigation />
    </div>
  );
}
