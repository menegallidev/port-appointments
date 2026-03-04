"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
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

type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: string;
  isActive: boolean;
  _count: {
    appointments: number;
  };
};

type ServicesResponse = {
  services?: Service[];
  error?: string;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [price, setPrice] = useState("45");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function loadServices() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/services");
      const data = (await response.json()) as ServicesResponse;

      if (!response.ok) {
        toast.error(data.error ?? "Erro ao carregar servicos.");
        return;
      }

      setServices(data.services ?? []);
    } catch {
      toast.error("Erro de conexao ao carregar servicos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadServices();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          durationMinutes: Number(durationMinutes),
          price: Number(price),
          isActive: true,
        }),
      });

      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Erro ao cadastrar servico.");
        return;
      }

      toast.success(data.message ?? "Servico cadastrado com sucesso.");
      setName("");
      setDescription("");
      setDurationMinutes("45");
      setPrice("45");
      await loadServices();
    } catch {
      toast.error("Erro de conexao ao cadastrar servico.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleService(service: Service) {
    setTogglingId(service.id);

    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });

      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Erro ao atualizar servico.");
        return;
      }

      toast.success(data.message ?? "Servico atualizado com sucesso.");
      await loadServices();
    } catch {
      toast.error("Erro de conexao ao atualizar servico.");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Servico</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duracao (min)</Label>
              <Input
                id="duration"
                type="number"
                min={10}
                max={240}
                step={5}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preco (R$)</Label>
              <Input
                id="price"
                type="number"
                min={1}
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descricao (opcional)</Label>
              <Textarea
                id="description"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner />
                    Salvando...
                  </>
                ) : (
                  "Salvar servico"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Servicos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : services.length === 0 ? (
            <p className="text-muted-foreground">Nenhum servico cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servico</TableHead>
                    <TableHead>Duracao</TableHead>
                    <TableHead>Preco</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agendamentos</TableHead>
                    <TableHead>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.description || "Sem descricao"}
                        </p>
                      </TableCell>
                      <TableCell>{service.durationMinutes} min</TableCell>
                      <TableCell>{formatCurrency(Number(service.price))}</TableCell>
                      <TableCell>
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{service._count.appointments}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void toggleService(service)}
                          disabled={togglingId === service.id}
                        >
                          {togglingId === service.id ? (
                            <>
                              <Spinner />
                              Atualizando...
                            </>
                          ) : service.isActive ? (
                            "Desativar"
                          ) : (
                            "Ativar"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
