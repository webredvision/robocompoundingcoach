export const FundPerformanceSkeleton = () => {
    return (
        <div className="">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="p-4 border border-gray-200 rounded shadow-sm animate-pulse bg-white mt-2"
                >
                    <div className="grid grid-cols-8 gap-10">
                        <div className="col-span-4">
                            <div className="h-5 bg-gray-200 rounded mb-1"></div>
                            <div className="h-5 w-3/4 bg-gray-200 rounded mb-1"></div>
                        </div>
                        <div className="">
                            <div className="h-5 bg-gray-200 rounded mb-1"></div>
                            <div className="h-5 bg-gray-200 rounded mb-1"></div>
                        </div>
                        <div className="">
                            <div className="h-5 bg-gray-200 rounded mb-1"></div>
                            <div className="h-5 bg-gray-200 rounded mb-1"></div>
                        </div>
                        <div className="">
                            <div className="h-5 bg-gray-200 rounded mb-1"></div>
                            <div className="h-5 bg-gray-200 rounded mb-1"></div>
                        </div>
                        <div className="">
                            <div className="h-12 bg-gray-200 rounded mb-3"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};