import type { AppointmentStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { statusColor, statusLabel } from "@/lib/status";

type Props = {
  status: AppointmentStatus;
};

export function AppointmentStatusBadge({ status }: Props) {
  return <Badge variant={statusColor[status]}>{statusLabel[status]}</Badge>;
}
