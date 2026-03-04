import { Spinner } from "@/components/ui/spinner";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Carregando sistema...
      </div>
    </div>
  );
}
