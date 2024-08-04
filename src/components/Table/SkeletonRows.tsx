import { cn } from "@component/lib/utils";
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
          <div
            className={cn(
              "bg-gray-300 rounded-md animate-pulse min-w-[100px] h-4",
              "dark:bg-gray-700"
            )}
          ></div>
        </td>
      ))}
    </tr>
  );
};

export default SkeletonRow;
