import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-44" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-full md:col-span-2" />
          <Skeleton className="h-9 w-32 md:col-span-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-52" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`service-row-${index.toString()}`} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
