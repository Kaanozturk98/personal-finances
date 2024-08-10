"use client";
import "../styles/global.css";
import "../styles/custom.css";
import "react-toastify/dist/ReactToastify.css";
import { Inter as FontSans } from "next/font/google";

import { ReactNode, useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable";
import SideNavbar from "../components/SideNavBar";
import { ToastContainer } from "react-toastify";
import { cn } from "@/lib/utils";

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
    <html lang="en" data-theme="dark">
      <body
        className={cn(
          "min-h-screen w-full font-sans overflow-x-hidden flex",
          fontSans.variable
        )}
      >
        <div className="grow text-white">
          <ResizablePanelGroup direction="horizontal">
            {!isCollapsed && (
              <>
                <ResizablePanel
                  className="grow"
                  order={1}
                  id="'side-navbar"
                  defaultSize={isCollapsed ? 0 : 12}
                  maxSize={isCollapsed ? 0 : 12}
                >
                  <SideNavbar />
                </ResizablePanel>

                <ResizableHandle />
              </>
            )}

            <ResizablePanel
              order={2}
              className={"flex w-full grow flex-col gap-4 bg-neutral-900"}
              defaultSize={isCollapsed ? 100 : 88}
            >
              {children}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        <ToastContainer />
      </body>
    </html>
  );
};

export default RootLayout;
