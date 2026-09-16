import { Skeleton } from "@/components/ui/skeleton";

export function FundListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-[#374716] text-white rounded-md p-4 flex justify-between items-center"
        >
          <div className="flex flex-col gap-2 w-[60%]">
            <Skeleton className="h-5 w-[250px] rounded" /> {/* Fund name */}
            <Skeleton className="h-4 w-[180px] rounded" /> {/* Fund type */}
          </div>

          <div className="flex flex-col text-right items-end gap-2 w-[30%]">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-200">
                <Skeleton className="h-4 w-[90px] rounded" /> {/* Corpus */}
              </div>
              <div className="text-sm text-gray-200">
                <Skeleton className="h-4 w-[70px] rounded" /> {/* NAV */}
              </div>
              <div className="text-sm text-green-400">
                <Skeleton className="h-4 w-[80px] rounded" /> {/* CAGR */}
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-md" /> {/* Invest button */}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FundDetailSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 py-6">
      {/* Left Side - Fund Info & Chart */}
      <div className="flex-1 bg-white rounded-xl shadow p-6 space-y-6">
        {/* Fund Header */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-2/3 rounded" /> {/* Fund Name */}
          <Skeleton className="h-4 w-1/3 rounded" /> {/* Fund Type */}
        </div>

        {/* NAV / Corpus / CAGR */}
        <div className="flex gap-8">
          <div className="space-y-1">
            <Skeleton className="h-4 w-20 rounded" /> {/* NAV */}
            <Skeleton className="h-4 w-10 rounded" /> {/* Label */}
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-28 rounded" /> {/* Corpus */}
            <Skeleton className="h-4 w-16 rounded" /> {/* Label */}
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-20 rounded" /> {/* CAGR */}
            <Skeleton className="h-4 w-20 rounded" /> {/* Label */}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="w-full h-[250px] rounded-md overflow-hidden">
          <Skeleton className="h-full w-full rounded" />
        </div>

        {/* Date Range Buttons */}
        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-10 rounded" />
          ))}
        </div>

        {/* Footer Note */}
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>

      {/* Right Side - SIP Calculator */}
      <div className="w-full lg:w-[350px] bg-white rounded-xl shadow p-6 space-y-4">
        <Skeleton className="h-6 w-40 rounded" /> {/* SIP Calculator Title */}

        {/* Tabs */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>

        {/* Monthly investment slider */}
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-4 w-full rounded" />

        {/* Years slider */}
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-4 w-full rounded" />

        {/* Result Cards */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-full rounded" />
          <Skeleton className="h-6 w-full rounded" />
          <Skeleton className="h-6 w-full rounded" />
        </div>
      </div>
    </div>
  );
}



export function FundCategorySkeleton() {
  const items = Array.from({ length: 39 });

  return (
    <>
      {items.map((_, idx) => (
        <div
          key={idx}
          className="group flex items-center px-4 justify-between rounded-lg hover:scale-110 transition-all cursor-pointer bg-[#ffffff2a] p-2"
        >
          <div className="flex items-center gap-3">
            <div className="bg-[#374716] rounded-full p-2">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-4 w-40 rounded" />
          </div>

          <div className="p-1 rounded-full transition-all group-hover:bg-white group-hover:p-2 group-hover:-rotate-45 bg-[#ffffff3f]">
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}

