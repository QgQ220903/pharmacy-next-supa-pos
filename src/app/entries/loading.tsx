import { Card, CardContent } from "@/components/ui/card";

export default function EntriesLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-muted rounded animate-pulse" />
          <div className="h-9 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-4 py-3 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="px-4 py-3">
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-1">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="col-span-1">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="col-span-1">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </div>
                <div className="col-span-1">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="col-span-1">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="col-span-1">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
