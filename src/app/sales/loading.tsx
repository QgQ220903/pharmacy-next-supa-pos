import { Card, CardContent } from "@/components/ui/card";

export default function SalesLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-8 w-52 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-64 bg-muted rounded animate-pulse" />
          <div className="h-9 w-9 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-7 w-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-10 w-10 bg-muted rounded-xl animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Card Skeleton */}
      <Card className="border-border/50 shadow-sm">
        {/* Card Header */}
        <div className="px-6 py-4 border-b">
          <div className="space-y-1.5">
            <div className="h-5 w-36 bg-muted rounded animate-pulse" />
            <div className="h-4 w-28 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <CardContent className="p-0">
          {/* Table Header */}
          <div className="border-b bg-muted/50 px-6 py-3">
            <div className="grid grid-cols-[180px_200px_150px_1fr_120px_80px] gap-4">
              {[180, 140, 100, 80, 100, 40].map((w, i) => (
                <div
                  key={i}
                  className={`h-4 bg-muted rounded animate-pulse ${i >= 3 ? "ml-auto" : ""}`}
                  style={{ width: `${w * 0.6}px` }}
                />
              ))}
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div key={row} className="px-6 py-3">
                <div className="grid grid-cols-[180px_200px_150px_1fr_120px_80px] gap-4 items-center">
                  {/* Sale code */}
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-muted rounded-md animate-pulse shrink-0" />
                    <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                  </div>
                  {/* Customer */}
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  </div>
                  {/* Date */}
                  <div className="space-y-1">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                  </div>
                  {/* Amount */}
                  <div className="h-4 w-24 bg-muted rounded animate-pulse ml-auto" />
                  {/* Payment badge */}
                  <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
