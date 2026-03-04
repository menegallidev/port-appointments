import { z } from "zod";

import { isValidPhone } from "@/lib/phone";

export const registerSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres."),
  email: z.string().trim().email("Informe um e-mail válido."),
  phone: z
    .string()
    .trim()
    .refine((value) => isValidPhone(value), "Informe um telefone válido."),
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres.")
    .max(100, "A senha é muito longa."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export const appointmentCreateSchema = z.object({
  serviceId: z.string().min(1, "Serviço é obrigatório."),
  appointmentAt: z.string().min(1, "Data/hora é obrigatória."),
  notes: z.string().trim().max(500, "Observações muito longas.").optional(),
  guestName: z.string().trim().min(3).max(120).optional(),
  guestEmail: z.string().trim().email().optional().or(z.literal("")),
  guestPhone: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => value === undefined || isValidPhone(value),
      "Informe um telefone válido.",
    ),
});

export const customerCreateSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres."),
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .refine((value) => isValidPhone(value), "Informe um telefone válido."),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const appointmentStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"]),
});
