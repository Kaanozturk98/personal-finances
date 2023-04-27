import "../styles/globals.css";
import "../styles/custom.css";

import { ReactNode } from "react";
import SideNavbar from "../components/SideNavBar";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" data-theme="dark" className="bg-gray-600">
      <body className="text-base-content">
        <div className="flex min-h-screen">
          <div className="w-72 shadow-md">
            <SideNavbar />
          </div>
          <div className="flex-1 p-8">{children}</div>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
