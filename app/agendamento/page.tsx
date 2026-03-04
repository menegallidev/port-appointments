"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { AppointmentStatusBadge } from "@/components/appointment-status-badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import { formatPhoneMask } from "@/lib/phone";
import { cn } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  phone: string | null;
};

type Appointment = {
  id: string;
  appointmentAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  notes: string | null;
  service: {
    name: string;
    price: string;
  };
};

function getDefaultAppointmentDate() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return date;
}

function getTimeOptions() {
  const times: string[] = [];

  for (let hour = 8; hour <= 20; hour += 1) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 20) {
      times.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }

  return times;
}

export default function AppointmentPage() {
  const defaultAppointmentDate = useMemo(() => getDefaultAppointmentDate(), []);
  const timeOptions = useMemo(() => getTimeOptions(), []);

  const [services, setServices] = useState<Service[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [serviceId, setServiceId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(
    defaultAppointmentDate,
  );
  const [appointmentTime, setAppointmentTime] = useState(
    format(defaultAppointmentDate, "HH:mm"),
  );
  const [notes, setNotes] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const requiresPhoneForLoggedUser = Boolean(user && !user.phone);

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId) ?? null,
    [serviceId, services],
  );

  const loadUserAppointments = useCallback(async () => {
    const response = await fetch("/api/appointments");
    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { appointments: Appointment[] };
    setAppointments(data.appointments);
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setFetching(true);
      const [servicesResponse, meResponse] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/auth/me"),
      ]);

      const servicesData = (await servicesResponse.json()) as {
        services: Service[];
      };

      setServices(servicesData.services ?? []);
      if (servicesData.services.length > 0) {
        setServiceId(servicesData.services[0].id);
      }

      const meData = (await meResponse.json()) as { user: User | null };
      setUser(meData.user);
      if (meData.user) {
        await loadUserAppointments();
      }
    } catch {
      toast.error("Nao foi possivel carregar os dados do agendamento.");
    } finally {
      setFetching(false);
    }
  }, [loadUserAppointments]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      if (!appointmentDate) {
        toast.error("Selecione uma data para o agendamento.");
        return;
      }

      if (!appointmentTime) {
        toast.error("Selecione um horario para o agendamento.");
        return;
      }

      const [hours, minutes] = appointmentTime.split(":").map(Number);
      const appointmentAt = new Date(appointmentDate);
      appointmentAt.setHours(hours, minutes, 0, 0);

      const payload: Record<string, string> = {
        serviceId,
        appointmentAt: appointmentAt.toISOString(),
        notes,
      };

      if (!user) {
        payload.guestName = guestName;
        payload.guestEmail = guestEmail;
        payload.guestPhone = guestPhone;
      } else if (requiresPhoneForLoggedUser) {
        payload.guestPhone = guestPhone;
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Nao foi possivel criar o agendamento.");
        return;
      }

      toast.success(data.message ?? "Agendamento criado com sucesso.");
      setNotes("");

      const nextDefaultDate = getDefaultAppointmentDate();
      setAppointmentDate(nextDefaultDate);
      setAppointmentTime(format(nextDefaultDate, "HH:mm"));

      if (!user) {
        setGuestName("");
        setGuestEmail("");
        setGuestPhone("");
      } else {
        await loadUserAppointments();
      }
    } catch {
      toast.error("Erro de conexao. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold">Agendar horario</h1>
              <p className="text-muted-foreground">
                {user
                  ? `Ola, ${user.name}. Escolha o servico e confirme o horario.`
                  : "Voce pode agendar como visitante ou criar uma conta para acompanhar seus horarios."}
              </p>
              {!user ? (
                <p className="text-sm text-muted-foreground">
                  Ja possui conta?{" "}
                  <Link href="/login" className="font-medium text-foreground">
                    Entrar
                  </Link>{" "}
                  |{" "}
                  <Link href="/cadastro" className="font-medium text-foreground">
                    Criar conta
                  </Link>
                </p>
              ) : null}
            </div>

            {user?.role === "ADMIN" ? (
              <Button asChild variant="outline">
                <Link href="/admin/agendamentos">Voltar ao admin</Link>
              </Button>
            ) : null}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Novo agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {!user ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="guestName">Nome</Label>
                      <Input
                        id="guestName"
                        value={guestName}
                        onChange={(event) => setGuestName(event.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="guestEmail">E-mail (opcional)</Label>
                        <Input
                          id="guestEmail"
                          type="email"
                          value={guestEmail}
                          onChange={(event) => setGuestEmail(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guestPhone">Telefone</Label>
                        <Input
                          id="guestPhone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder="(11) 99999-9999"
                          maxLength={15}
                          value={guestPhone}
                          onChange={(event) =>
                            setGuestPhone(formatPhoneMask(event.target.value))
                          }
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : null}

                {requiresPhoneForLoggedUser ? (
                  <div className="space-y-2">
                    <Label htmlFor="guestPhoneLogged">
                      Telefone para cadastro de cliente
                    </Label>
                    <Input
                      id="guestPhoneLogged"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      value={guestPhone}
                      onChange={(event) =>
                        setGuestPhone(formatPhoneMask(event.target.value))
                      }
                      required
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label>Servico</Label>
                  <Select value={serviceId} onValueChange={setServiceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um servico" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({service.durationMinutes}min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !appointmentDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {appointmentDate
                            ? format(appointmentDate, "dd/MM/yyyy")
                            : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={appointmentDate}
                          onSelect={setAppointmentDate}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horario" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observacoes (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={loading || !serviceId}>
                  {loading ? "Enviando..." : "Confirmar agendamento"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do servico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {selectedService ? (
                <>
                  <p className="font-medium">{selectedService.name}</p>
                  <p className="text-muted-foreground">
                    Duracao: {selectedService.durationMinutes} minutos
                  </p>
                  <p className="text-muted-foreground">
                    Valor: {formatCurrency(Number(selectedService.price))}
                  </p>
                  {selectedService.description ? (
                    <p className="text-muted-foreground">
                      {selectedService.description}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-muted-foreground">
                  Selecione um servico para ver os detalhes.
                </p>
              )}
            </CardContent>
          </Card>

          {user ? (
            <Card>
              <CardHeader>
                <CardTitle>Meus agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Voce ainda nao possui agendamentos.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Servico</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <p>{appointment.service.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(Number(appointment.service.price))}
                              </p>
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(appointment.appointmentAt),
                                "dd/MM/yyyy 'as' HH:mm",
                              )}
                            </TableCell>
                            <TableCell>
                              <AppointmentStatusBadge status={appointment.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </section>
      </main>
    </div>
  );
}
