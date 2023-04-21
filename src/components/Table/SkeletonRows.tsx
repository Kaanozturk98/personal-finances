import React from "react";

interface SkeletonRowProps {
  columns: number;
}

const SkeletonRow: React.FC<SkeletonRowProps> = ({ columns }) => {
  const skeletons = Array(columns).fill(null);

  return (
    <tr>
      {skeletons.map((_, index) => (
        <td key={index} className="p-2">
          <div className="bg-gray-300 rounded animate-pulse w-full h-4"></div>
        </td>
      ))}
    </tr>
  );
};

export default SkeletonRow;
