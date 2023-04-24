import React from "react";

interface SkeletonRowProps {
  columns: number;
}

const SkeletonRow: React.FC<SkeletonRowProps> = ({ columns }) => {
  const skeletons = Array(columns).fill(null);

  return (
    <tr className="h-12">
      {skeletons.map((_, index) => (
        <td key={index} className="py-2 px-3">
          <div className="bg-gray-600 rounded animate-pulse min-w-[100px] h-4"></div>
        </td>
      ))}
    </tr>
  );
};

export default SkeletonRow;
