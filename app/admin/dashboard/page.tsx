"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";

type DashboardData = {
  metrics: {
    totalAppointments: number;
    pendingAppointments: number;
    approvedAppointments: number;
    completedAppointments: number;
    totalCustomers: number;
    monthRevenue: number;
  };
  charts: {
    appointmentsByDay: { date: string; total: number }[];
    statusDistribution: { status: string; total: number }[];
    servicePerformance: {
      service: string;
      appointments: number;
      revenue: number;
    }[];
  };
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluído",
};

const statusColors = ["#f59e0b", "#10b981", "#ef4444", "#64748b", "#3b82f6"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/dashboard");
        const json = (await response.json()) as DashboardData & { error?: string };

        if (!response.ok) {
          const message = json.error ?? "Falha ao carregar dashboard.";
          setError(message);
          toast.error(message);
          return;
        }

        setData(json);
      } catch {
        const message = "Erro de conexao ao carregar dashboard.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const metricCards = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        label: "Agendamentos",
        value: data.metrics.totalAppointments.toString(),
      },
      {
        label: "Pendentes",
        value: data.metrics.pendingAppointments.toString(),
      },
      {
        label: "Aprovados",
        value: data.metrics.approvedAppointments.toString(),
      },
      {
        label: "Concluídos",
        value: data.metrics.completedAppointments.toString(),
      },
      {
        label: "Clientes",
        value: data.metrics.totalCustomers.toString(),
      },
      {
        label: "Receita do mês",
        value: formatCurrency(data.metrics.monthRevenue),
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={`dashboard-loading-metric-${index.toString()}`}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </section>
        <section className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </section>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-destructive">{error ?? "Erro ao carregar."}</p>;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos por dia (7 dias)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.appointmentsByDay}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#0f172a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por status</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.statusDistribution}
                  dataKey="total"
                  nameKey="status"
                  outerRadius={90}
                  label={(props) => {
                    const payload = props.payload as { status: string };
                    const label = statusLabel[payload.status] ?? payload.status;
                    return `${label}: ${props.value as number}`;
                  }}
                >
                  {data.charts.statusDistribution.map((_, index) => (
                    <Cell
                      key={`status-${index.toString()}`}
                      fill={statusColors[index % statusColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por serviço (mês)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.servicePerformance}>
                <XAxis dataKey="service" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
