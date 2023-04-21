import clsx from "clsx";
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
  }, [textRef]);

  return (
    <div
      className={clsx("relative", isTruncated ? "tooltip" : "")}
      data-tip={text}
    >
      <span ref={textRef} className={clsx("truncate-description", className)}>
        {text}
      </span>
    </div>
  );
};

export default TruncatedText;
