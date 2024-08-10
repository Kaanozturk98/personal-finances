/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Reports", href: "/reports" },
  { name: "Analytics", href: "/analytics" },
  { name: "Transactions", href: "/transactions" },
  { name: "Categories", href: "/categories" },
  { name: "Asset Types", href: "/asset-types" },
  { name: "Asset Holdings", href: "/asset-holdings" },
  { name: "Upload", href: "/upload" },
];

const SideNavbar: React.FC = () => {
  const currentPath = usePathname();

  return (
    <nav className="h-full flex flex-col p-4 bg-neutral-800/[0.93]">
      <div className="mt-4 mb-8 flex items-center justify-start">
        <img src="/line-graph.png" alt="Logo" className="w-16 min-w-16" />
      </div>
      <div className="flex h-full w-full grow flex-col items-start pb-4 pt-3 text-white gap-2">
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="inline-flex h-9 transform items-center justify-center rounded-lg bg-transparent px-2.5 py-3
          opacity-50
          transition-all duration-200 hover:bg-[#FFFFFF14] focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-ring
          focus-visible:ring-offset-2 active:scale-[95%]
          disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-indigo-500 data-[state=on]:opacity-100"
            data-state={item.href === currentPath ? "on" : "off"}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default SideNavbar;
