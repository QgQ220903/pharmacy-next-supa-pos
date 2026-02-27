// app/entries/new/loading.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function NewEntryLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      </div>

      {/* Product Search Section Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-muted rounded animate-pulse" />
              <div className="h-6 w-40 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-4 w-72 bg-muted rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search input */}
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
            
            {/* Quick products */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Columns Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Supplier Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                <div className="h-6 w-40 bg-muted rounded animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 w-full bg-muted rounded animate-pulse" />
              <div className="h-24 w-full bg-muted rounded animate-pulse" />
              <div className="h-32 w-full bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Product List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
                </div>
                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              {/* Empty state skeleton */}
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-6 animate-pulse" />
                <div className="h-6 w-64 bg-muted rounded mx-auto mb-3 animate-pulse" />
                <div className="h-4 w-80 bg-muted rounded mx-auto mb-6 animate-pulse" />
                <div className="flex gap-3 justify-center">
                  <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-40 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}