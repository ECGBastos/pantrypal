"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Lightbulb, Settings, ShoppingCart } from "lucide-react";

const navItems = [
  { href: "/shopping", label: "Compras", icon: ShoppingCart },
  { href: "/inventory", label: "Casa", icon: Box },
  { href: "/ideas", label: "Ideias", icon: Lightbulb },
  { href: "/settings", label: "Definições", icon: Settings }
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 z-50 w-full rounded-t-2xl px-5 pt-2">
      <div className="mobile-shell flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`}>
              <Icon size={24} strokeWidth={active ? 2.6 : 2.2} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
