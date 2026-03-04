import Link from "next/link";
import { BarChart3, CalendarClock, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Agendamento Rápido",
    description:
      "Clientes podem agendar com conta ou como visitante em poucos passos.",
    icon: CalendarClock,
  },
  {
    title: "Gestão de Clientes",
    description:
      "Cadastro e histórico de clientes para aumentar retenção e recorrência.",
    icon: UserPlus,
  },
  {
    title: "Dashboard Estratégico",
    description:
      "Visualize volume de atendimentos, aprovação e receita em tempo real.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 md:px-8">
        <section className="rounded-3xl border bg-card p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Barbearia Pro
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            Sistema completo de agendamento para sua barbearia.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Cadastre usuários, receba agendamentos com ou sem conta, aprove
            horários pelo painel administrativo e acompanhe indicadores no
            dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/agendamento">Agendar horário</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/cadastro">Criar conta</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/admin/dashboard">Ir para painel</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="size-5" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {item.description}
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>
    </div>
  );
}
