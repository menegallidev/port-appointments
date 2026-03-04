import type { AppointmentStatus } from "@prisma/client";

export const statusLabel: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluído",
};

export const statusColor: Record<AppointmentStatus, "default" | "secondary" | "destructive" | "outline"> =
  {
    PENDING: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
    CANCELLED: "outline",
    COMPLETED: "default",
  };
