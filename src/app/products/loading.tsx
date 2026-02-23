export default function ProductsLoading() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3">
          {/* Title */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-primary/20 rounded-full" />
            <div className="h-8 bg-muted animate-pulse rounded-md w-48" />
          </div>
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-96 max-w-full" />
            <div className="h-4 bg-muted animate-pulse rounded w-72 max-w-full" />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-28 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`stat-${i}`} className="border rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
            </div>
            <div className="h-8 bg-muted animate-pulse rounded w-20" />
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div className="space-y-1">
                <div className="h-3 bg-muted animate-pulse rounded w-12" />
                <div className="h-4 bg-muted animate-pulse rounded w-16" />
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-muted animate-pulse rounded w-12" />
                <div className="h-4 bg-muted animate-pulse rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="border rounded-lg p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
            <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
            <div className="h-10 w-28 bg-muted animate-pulse rounded-md" />
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
          <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
          <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-muted/30 px-6 py-4 border-b">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`header-${i}`}
                className="h-4 bg-muted animate-pulse rounded w-20"
              />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y">
          {Array.from({ length: 10 }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="px-6 py-4">
              <div className="grid grid-cols-6 gap-4 items-center">
                {/* Product Info */}
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    <div className="space-y-1 flex-1">
                      <div className="h-4 bg-muted animate-pulse rounded w-32" />
                      <div className="h-3 bg-muted animate-pulse rounded w-24" />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <div className="h-6 bg-muted animate-pulse rounded-full w-20" />
                </div>

                {/* Stock */}
                <div>
                  <div className="h-6 bg-muted animate-pulse rounded w-16" />
                </div>

                {/* Price */}
                <div>
                  <div className="h-4 bg-muted animate-pulse rounded w-20" />
                </div>

                {/* Batch */}
                <div className="flex justify-center">
                  <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-1">
                  <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Footer (Pagination) */}
        <div className="bg-muted/20 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-muted animate-pulse rounded w-40" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
