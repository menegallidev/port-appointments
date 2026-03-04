import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AdminMobileMenu } from "@/components/admin/admin-mobile-menu";
import { LogoutButton } from "@/components/admin/logout-button";

type Props = {
  name: string;
  email: string;
};

export function AdminTopbar({ name, email }: Props) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <AdminMobileMenu />
          <div>
            <p className="text-sm font-medium">Painel Administrativo</p>
            <p className="text-xs text-muted-foreground">
              Gerencie clientes, agendamentos e desempenho
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <Avatar className="size-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
