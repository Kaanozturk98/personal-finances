/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@component/lib/utils";

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
    <nav className="h-full bg-background text-primary flex flex-col p-4">
      <div className="mt-4 mb-8 flex items-center justify-center">
        <img src="/line-graph.png" alt="Logo" className="h-16 w-auto" />
      </div>
      <ul className="space-y-4">
        {navItems.map((item, index) => (
          <li key={index}>
            <Link href={item.href}>
              <a
                className={cn(
                  "block w-full text-left py-2 px-4 transition-colors duration-200 border-l-4",
                  currentPath === item.href
                    ? "border-primary bg-primary text-white"
                    : "border-transparent hover:border-primary"
                )}
              >
                {item.name}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SideNavbar;
