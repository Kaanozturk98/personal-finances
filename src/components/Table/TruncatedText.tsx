import { cn } from "@component/lib/utils";
import React, { useEffect, useState, useRef } from "react";

interface TruncatedTextProps {
  text: string;
  className?: string;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  className = "",
}) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const { scrollWidth, clientWidth } = textRef.current;
      setIsTruncated(scrollWidth > clientWidth);
    }
  }, [text, textRef]);

  return (
    <div
      className={cn("relative overflow-hidden", className)} // Used cn for conditional class names
      {...(isTruncated && { "data-tooltip": text })} // Conditional tooltip data attribute
    >
      <span
        ref={textRef}
        className={cn(
          "block truncate text-gray-900 dark:text-gray-100",
          className
        )}
      >
        {text}
      </span>
    </div>
  );
};

export default TruncatedText;
