import React from "react";

interface SkeletonRowProps {
  columns: number;
  columnWidths: number[];
}

const SkeletonRow: React.FC<SkeletonRowProps> = ({ columns, columnWidths }) => {
  return (
    <tr className="h-11 border-b">
      {Array(columns)
        .fill(null)
        .map((_, index) => (
          <td
            key={index}
            className="p-2"
            style={{
              width: columnWidths[index]
                ? `${columnWidths[index] - 8}px`
                : "auto",
            }}
          >
            <div className="bg-muted h-4 rounded-md animate-pulse"></div>
          </td>
        ))}
    </tr>
  );
};

export default SkeletonRow;
