export default function POSLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-52 bg-muted rounded animate-pulse" />
          <div className="h-4 w-40 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-32 bg-muted rounded animate-pulse" />
          <div className="h-9 w-36 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Separator Skeleton */}
      <div className="h-px bg-muted" />

      {/* POS Form Skeleton */}
      <div className="h-[calc(100vh-130px)] flex flex-col rounded-xl border shadow-lg overflow-hidden bg-card">
        {/* Search bar */}
        <div className="shrink-0 px-4 py-2 border-b bg-card/30 flex items-center gap-3">
          <div className="flex-1 max-w-xl">
            <div className="h-9 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="h-4 w-48 bg-muted rounded animate-pulse hidden sm:block" />
        </div>

        <div className="flex flex-1 min-h-0 divide-x">
          {/* Cart column */}
          <div className="flex-1 flex flex-col min-w-[500px]">
            {/* Cart header */}
            <div className="shrink-0 px-6 py-3 border-b bg-muted/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-muted rounded-lg animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 p-2 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-8 w-8 bg-muted rounded-lg animate-pulse shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-7 w-7 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-28 bg-muted rounded-md animate-pulse" />
                    <div className="h-8 w-32 bg-muted rounded-md animate-pulse" />
                    <div className="h-8 w-28 bg-muted rounded-md animate-pulse" />
                    <div className="ml-auto h-10 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout column */}
          <div className="w-96 flex flex-col border-l bg-card/30">
            {/* Checkout header */}
            <div className="shrink-0 px-4 py-3 border-b bg-muted/10 flex items-center gap-2">
              <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>

            {/* Checkout content */}
            <div className="flex-1 p-4 space-y-4">
              {/* Customer info card */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="h-4 w-36 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-9 w-full bg-muted rounded animate-pulse" />
                  <div className="h-9 w-full bg-muted rounded animate-pulse" />
                </div>
              </div>

              {/* Discount card */}
              <div className="rounded-lg border p-4 space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-9 w-full bg-muted rounded animate-pulse" />
              </div>

              {/* Payment method card */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>

              {/* Summary card */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-px bg-muted" />
                <div className="flex justify-between items-baseline">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-32 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Checkout button */}
            <div className="shrink-0 p-4 border-t bg-card">
              <div className="h-12 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-2 border-t bg-muted/5 flex items-center gap-4">
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
