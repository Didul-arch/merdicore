import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-48 mb-8" />

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="p-6 md:p-10 border-b border-gray-100 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="p-6 md:p-10 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
