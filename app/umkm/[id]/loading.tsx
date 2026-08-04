import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-44 mb-8" />

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Skeleton className="h-72 md:h-96 rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
