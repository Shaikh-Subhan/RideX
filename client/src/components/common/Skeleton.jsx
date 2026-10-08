import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return <div className={`animate-pulse bg-rx-surface rounded-xl ${className}`} />;
};

export const VehicleCardSkeleton = () => {
  return (
    <div className="bg-rx-card rounded-2xl border border-rx-border overflow-hidden flex flex-col h-full">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-7 w-full rounded-lg" />
            <Skeleton className="h-7 w-full rounded-lg" />
            <Skeleton className="h-7 w-full rounded-lg" />
          </div>
        </div>
        <div className="pt-4 border-t border-rx-border flex items-center justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <tr className="border-b border-rx-border">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  );
};

export default Skeleton;
