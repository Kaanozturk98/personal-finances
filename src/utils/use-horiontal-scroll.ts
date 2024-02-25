import React, { useEffect } from "react";

const useHorizontalScroll = (ref: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const tableContainer = ref.current;
    if (!tableContainer) return;

    let isSpacePressed = false;
    let startScrollX = 0;
    let startMouseX = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the target is an input, textarea, or contentEditable element
      const target = e.target as HTMLElement;
      const isTypingElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.code === "Space" && !isTypingElement) {
        e.preventDefault(); // Prevent the default spacebar action (page down)
        isSpacePressed = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpacePressed = false;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (isSpacePressed && e.button === 0) {
        // 0 is the left mouse button
        startScrollX = tableContainer.scrollLeft;
        startMouseX = e.clientX;
        tableContainer.style.cursor = "grabbing";
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isSpacePressed && e.buttons === 1) {
        // 1 indicates left mouse button down
        const distanceX = e.clientX - startMouseX;
        tableContainer.scrollLeft = startScrollX - distanceX;
      }
    };

    const handleMouseUp = () => {
      if (isSpacePressed) {
        tableContainer.style.cursor = ""; // Reset the cursor style
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    tableContainer.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      tableContainer.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [ref]);
};

export default useHorizontalScroll;
