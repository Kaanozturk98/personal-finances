/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Reports", href: "/reports" },
  { name: "Transactions", href: "/transactions" },
  { name: "Categories", href: "/categories" },
  { name: "Upload", href: "/upload" },
];

const SideNavbar: React.FC = () => {
  return (
    <nav className="h-full bg-base-300 text-primary-content flex flex-col p-4">
      <div className="mt-4 mb-8 flex items-center justify-center">
        <img src="/line-graph.png" alt="Logo" className="h-16 w-auto" />
      </div>
      <ul className="space-y-4">
        {navItems.map((item, index) => (
          <li key={index}>
            <Link
              href={item.href}
              className="block w-full text-left py-2 px-4 transition-colors duration-200 border-l-4 border-transparent hover:border-primary"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SideNavbar;
