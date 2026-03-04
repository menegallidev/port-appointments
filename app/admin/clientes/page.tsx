"use client";

import { FormEvent, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

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
import { formatPhoneMask } from "@/lib/phone";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  notes: string | null;
  createdAt: string;
  _count: {
    appointments: number;
  };
};

type CustomersApiResponse = {
  customers?: Customer[];
  error?: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadCustomers() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/customers");
      const data = (await response.json()) as CustomersApiResponse;

      if (!response.ok) {
        toast.error(data.error ?? "Erro ao carregar clientes.");
        return;
      }

      setCustomers(data.customers ?? []);
    } catch {
      toast.error("Erro de conexão ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, notes }),
      });

      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Erro ao cadastrar cliente.");
        return;
      }

      toast.success(data.message ?? "Cliente cadastrado com sucesso.");
      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
      await loadCustomers();
    } catch {
      toast.error("Erro de conexão ao cadastrar cliente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Cliente</CardTitle>
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
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(11) 99999-9999"
                maxLength={15}
                value={phone}
                onChange={(event) => setPhone(formatPhoneMask(event.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
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
                  "Salvar cliente"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : customers.length === 0 ? (
            <p className="text-muted-foreground">Nenhum cliente cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Agendamentos</TableHead>
                    <TableHead>Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <p>{formatPhoneMask(customer.phone)}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.email ?? "Sem e-mail"}
                        </p>
                      </TableCell>
                      <TableCell>{customer._count.appointments}</TableCell>
                      <TableCell>
                        {format(new Date(customer.createdAt), "dd/MM/yyyy HH:mm")}
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
