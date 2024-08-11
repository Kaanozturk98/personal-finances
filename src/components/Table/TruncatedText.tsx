import React, { useEffect, useState, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TruncatedTextProps {
  text: string;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ text }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const { scrollWidth, clientWidth } = textRef.current;
      setIsTruncated(scrollWidth > clientWidth);
    }
  }, [text]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative overflow-hidden max-w-lg">
            <span
              className={`block truncate text-xs max-w-md font-medium`}
              ref={textRef}
            >
              {text}
            </span>
          </div>
        </TooltipTrigger>
        {isTruncated && (
          <TooltipContent>
            <span>{text}</span>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default TruncatedText;
