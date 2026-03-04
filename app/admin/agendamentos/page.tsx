"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { AppointmentStatusBadge } from "@/components/appointment-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPhoneMask } from "@/lib/phone";

type AppointmentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

type Appointment = {
  id: string;
  appointmentAt: string;
  status: AppointmentStatus;
  notes: string | null;
  customer: {
    name: string;
    phone: string;
  };
  service: {
    name: string;
  };
};

type ApiResponse = {
  appointments?: Appointment[];
  error?: string;
};

const filterOptions: { value: "ALL" | AppointmentStatus; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "APPROVED", label: "Aprovados" },
  { value: "REJECTED", label: "Rejeitados" },
  { value: "CANCELLED", label: "Cancelados" },
  { value: "COMPLETED", label: "Concluídos" },
];

const actionMap: Record<
  AppointmentStatus,
  { status: AppointmentStatus; label: string; variant?: "outline" | "default" }[]
> = {
  PENDING: [
    { status: "APPROVED", label: "Aprovar", variant: "default" },
    { status: "REJECTED", label: "Rejeitar", variant: "outline" },
  ],
  APPROVED: [
    { status: "COMPLETED", label: "Concluir", variant: "default" },
    { status: "CANCELLED", label: "Cancelar", variant: "outline" },
  ],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"ALL" | AppointmentStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchAppointments(currentFilter: "ALL" | AppointmentStatus) {
    setLoading(true);

    try {
      const search = new URLSearchParams();
      if (currentFilter !== "ALL") {
        search.set("status", currentFilter);
      }

      const response = await fetch(`/api/admin/appointments?${search.toString()}`);
      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        toast.error(data.error ?? "Erro ao carregar agendamentos.");
        return;
      }

      setAppointments(data.appointments ?? []);
    } catch {
      toast.error("Erro de conexao ao carregar agendamentos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchAppointments(filter);
  }, [filter]);

  async function updateStatus(appointmentId: string, status: AppointmentStatus) {
    setUpdatingId(appointmentId);

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Erro ao atualizar status.");
        return;
      }

      toast.success("Status atualizado com sucesso.");
      await fetchAppointments(filter);
    } catch {
      toast.error("Erro de conexao ao atualizar status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle>Aprovação de Agendamentos</CardTitle>
        <div className="max-w-xs">
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as "ALL" | AppointmentStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        ) : appointments.length === 0 ? (
          <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Data e hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <p className="font-medium">{appointment.customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPhoneMask(appointment.customer.phone)}
                      </p>
                    </TableCell>
                    <TableCell>{appointment.service.name}</TableCell>
                    <TableCell>
                      {format(
                        new Date(appointment.appointmentAt),
                        "dd/MM/yyyy 'às' HH:mm",
                      )}
                    </TableCell>
                    <TableCell>
                      <AppointmentStatusBadge status={appointment.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {actionMap[appointment.status].length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            Sem ações
                          </span>
                        ) : (
                          actionMap[appointment.status].map((action) => (
                            <Button
                              key={`${appointment.id}-${action.status}`}
                              size="sm"
                              variant={action.variant ?? "outline"}
                              onClick={() =>
                                void updateStatus(appointment.id, action.status)
                              }
                              disabled={updatingId === appointment.id}
                            >
                              {action.label}
                            </Button>
                          ))
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
