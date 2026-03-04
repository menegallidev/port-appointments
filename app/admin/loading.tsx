import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-72 border-r bg-sidebar p-4 md:block">
        <Skeleton className="h-16 w-full" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    </div>
  );
}
