// Modal.tsx
import React, { useState } from "react";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, children, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) return <div onClick={() => setIsOpen(true)}>{trigger}</div>;

  const modalClass = isOpen
    ? "opacity-100 pointer-events-auto"
    : "opacity-0 pointer-events-none";

  return (
    <>
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity ${modalClass}`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className="w-full max-w-md bg-base-200 p-6 mx-4 md:mx-0 my-8 rounded-xl shadow-lg z-10 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="close-btn btn btn-circle btn-ghost absolute top-4 right-4"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
          <h3 className="text-lg font-medium leading-6">{title}</h3>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </>
  );
};

export default Modal;
