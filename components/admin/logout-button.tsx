"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    let shouldRedirect = false;

    try {
      setLoading(true);
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        toast.error("Nao foi possivel encerrar a sessao.");
        return;
      }

      toast.success("Sessao encerrada com sucesso.");
      shouldRedirect = true;
    } catch {
      toast.error("Erro de conexao ao encerrar a sessao.");
    } finally {
      setLoading(false);

      if (shouldRedirect) {
        router.push("/login");
        router.refresh();
      }
    }
  }

  return (
    <Button variant="outline" onClick={handleLogout} disabled={loading}>
      {loading ? "Saindo..." : "Sair"}
    </Button>
  );
}
