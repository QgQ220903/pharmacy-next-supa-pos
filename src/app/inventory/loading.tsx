import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryLoading() {
  return (
    <div className="space-y-6 container mx-auto py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>

      <div className="w-[400px] h-10 bg-muted/50 rounded-md p-1 grid grid-cols-2 gap-1">
        <Skeleton className="h-full w-full rounded-sm" />
        <Skeleton className="h-full w-full rounded-sm" />
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 flex-1 min-w-[240px]" />
          <Skeleton className="h-10 w-[150px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-[140px]" />
            <Skeleton className="h-10 w-[20px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
          <Skeleton className="h-10 w-10" />
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="p-0">
             <Skeleton className="h-12 w-full" />
          </CardHeader>
          <CardContent className="p-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-border/30 p-4 flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-6 w-[100px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
