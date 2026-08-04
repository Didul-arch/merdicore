import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-40 mb-8" />

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <Skeleton className="h-64 sm:h-96 md:h-[28rem] rounded-none" />

          <div className="px-6 py-4 md:px-10 border-b border-gray-100 flex flex-wrap gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="p-6 md:p-10 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
