import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Button } from "./ui/button";

interface ModalProps {
  title: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  title,
  trigger,
  children,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const triggerWithDisabled = React.cloneElement(
    trigger as React.ReactElement,
    {
      disabled: disabled,
      "aria-disabled": disabled,
      onClick: () => {
        setIsOpen(!isOpen);
      },
    }
  );

  const modalClass = isOpen
    ? "opacity-100 pointer-events-auto"
    : "opacity-0 pointer-events-none";

  return (
    <>
      {triggerWithDisabled}
      {isOpen &&
        ReactDOM.createPortal(
          <div
            className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity ${modalClass}`}
            onClick={() => setIsOpen(false)}
          >
            <div
              className="w-full max-w-md bg-base-200 p-6 mx-4 md:mx-0 my-8 rounded-xl shadow-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                className="absolute top-4 right-4"
                onClick={() => setIsOpen(false)}
              >
                ×
              </Button>
              <h3 className="text-lg font-medium leading-6">{title}</h3>
              <div className="mt-4">{children}</div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Modal;
