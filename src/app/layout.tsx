"use client";
import "../styles/globals.css";
import "../styles/custom.css";
import "react-toastify/dist/ReactToastify.css";
import { Inter as FontSans } from "next/font/google";

import { ReactNode, useEffect, useState } from "react";
import SideNavbar from "../components/SideNavBar";
import { ToastContainer } from "react-toastify";
import clsx from "clsx";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const RootLayout = ({ children }: { children: ReactNode }) => {
  // Initialize the state directly from localStorage
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const isCollapsedFromLocalStorage = localStorage.getItem("isCollapsed");
    if (isCollapsedFromLocalStorage) {
      setIsCollapsed(isCollapsedFromLocalStorage === "true");
    }
  }, []);

  // Save the collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("isCollapsed", String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const toggleNavbar = () => {
      setIsCollapsed(!isCollapsed);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleNavbar();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isCollapsed, setIsCollapsed]);

  return (
    <html lang="en" data-theme="dark" className="bg-gray-600">
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          "overflow-x-hidden"
        )}
      >
        <div className="flex min-h-screen">
          {!isCollapsed && (
            <div className="w-72 shadow-md hidden xl:block">
              <SideNavbar />
            </div>
          )}

          <div
            className={clsx("flex-1 p-8", {
              "max-w-full": isCollapsed,
              "max-w-[calc(100vw-288px)] xl:max-w-[calc(100vw-288px)]":
                !isCollapsed,
            })}
          >
            {children}
          </div>
        </div>
        <ToastContainer />
      </body>
    </html>
  );
};

export default RootLayout;
