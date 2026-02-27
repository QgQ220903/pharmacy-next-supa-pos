import { Card, CardContent } from "@/components/ui/card";

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton - Giống Entries */}
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

      {/* Stats Cards Skeleton - Giống Entries */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-10 w-10 bg-muted rounded-xl animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Skeleton - Giống Entries nhưng giữ cấu trúc ProductFilters */}
      <Card className="border">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-7 w-16 bg-muted rounded animate-pulse" />
          </div>

          {/* Search */}
          <div className="relative">
            <div className="h-9 w-full bg-muted rounded animate-pulse" />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-md">
              <div className="h-7 w-16 bg-muted rounded animate-pulse" />
              <div className="h-7 w-16 bg-muted rounded animate-pulse" />
              <div className="h-7 w-16 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            <div className="h-8 w-28 bg-muted rounded animate-pulse" />
          </div>

          {/* Result count */}
          <div className="flex items-center justify-between text-sm pt-1 border-t">
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* Table Section - Giống Entries */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-4 py-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
            <div key={row} className="px-4 py-3">
              <div className="grid grid-cols-6 gap-4 items-center">
                {/* Product Info */}
                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-muted rounded-lg animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                </div>

                {/* Stock */}
                <div className="text-center">
                  <div className="space-y-1">
                    <div className="h-6 w-16 bg-muted rounded animate-pulse mx-auto" />
                    <div className="h-3 w-12 bg-muted rounded animate-pulse mx-auto" />
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <div className="space-y-1">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse ml-auto" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse ml-auto" />
                  </div>
                </div>

                {/* Status */}
                <div className="text-center">
                  <div className="space-y-1">
                    <div className="h-6 w-16 bg-muted rounded animate-pulse mx-auto" />
                    <div className="h-3 w-12 bg-muted rounded animate-pulse mx-auto" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton - Giống Entries */}
        <div className="px-4 py-3 border-t bg-muted/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-2">
            <div className="h-4 w-40 bg-muted rounded animate-pulse order-2 lg:order-1" />
            <div className="hidden md:flex items-center gap-1 order-1 lg:order-2">
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              <div className="flex items-center gap-1 mx-1">
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}