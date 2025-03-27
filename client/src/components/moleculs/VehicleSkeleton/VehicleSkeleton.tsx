export const VehicleSkeleton = () => {
  return (
    <div className="flex gap-3 px-4 items-center justify-between">
      <div className="flex gap-3 p-4">
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300"></div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-4 w-24 animate-pulse rounded-full bg-gray-300"></div>
          <div className="h-3 w-16 animate-pulse rounded-full bg-gray-300"></div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-gray-300"></div>
        <div className="h-6 w-16 animate-pulse rounded-full bg-gray-300"></div>
      </div>
    </div>
  );
};
