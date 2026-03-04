import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentsLoading() {
  return (
    <Card>
      <CardHeader className="gap-3">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-9 w-52" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`appointment-row-${index.toString()}`} className="h-14 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
