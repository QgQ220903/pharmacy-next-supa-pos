export default function ProductsLoading() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-10 bg-muted animate-pulse rounded w-64" />
          <div className="h-4 bg-muted animate-pulse rounded w-96" />
        </div>
        <div className="h-10 bg-muted animate-pulse rounded w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded" />
        ))}
      </div>

      <div className="h-96 bg-muted animate-pulse rounded" />
    </div>
  );
}
