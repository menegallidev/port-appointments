import { BarChart3, CalendarClock, Scissors, Users } from "lucide-react";

export const adminNavigation = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/admin/agendamentos",
    label: "Agendamentos",
    icon: CalendarClock,
  },
  {
    href: "/admin/servicos",
    label: "Servicos",
    icon: Scissors,
  },
  {
    href: "/admin/clientes",
    label: "Clientes",
    icon: Users,
  },
  {
    href: "/agendamento",
    label: "Novo Agendamento",
    icon: Scissors,
  },
];
