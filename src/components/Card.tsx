import React from "react";
import clsx from "clsx";

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, className, children }) => {
  return (
    <div className={clsx("bg-base-100 rounded-md shadow-md p-6", className)}>
      {title && <div className="text-lg font-bold mb-4">{title}</div>}
      <div className="h-full w-full">{children}</div>
    </div>
  );
};

export default Card;
