import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-muted/20">
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-56" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-44" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-9 w-44" />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
