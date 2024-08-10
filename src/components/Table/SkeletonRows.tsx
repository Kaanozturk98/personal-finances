import { cn } from "@/lib/utils";
import React from "react";

interface SkeletonRowProps {
  columns: number;
}

const SkeletonRow: React.FC<SkeletonRowProps> = ({ columns }) => {
  const skeletons = Array(columns).fill(null);

  return (
    <tr className="h-[53px]">
      {skeletons.map((_, index) => (
        <td key={index} className="py-2 px-3">
          <div className="bg-muted h-4 w-full rounded-md animate-pulse"></div>
        </td>
      ))}
    </tr>
  );
};

export default SkeletonRow;
