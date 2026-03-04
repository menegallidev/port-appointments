"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "@/components/admin/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r bg-sidebar text-sidebar-foreground md:block">
      <div className="border-b p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Sistema
        </p>
        <h1 className="mt-2 text-xl font-semibold">Barbearia Pro</h1>
      </div>

      <nav className="space-y-1 p-4">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Button
              asChild
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "h-10 w-full justify-start gap-2",
                !isActive && "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Link href={item.href}>
                <Icon className="size-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
