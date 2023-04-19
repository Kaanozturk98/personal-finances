/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Transactions", href: "/transactions" },
  { name: "Budget", href: "/budget" },
  { name: "Settings", href: "/settings" },
];

const SideNavbar: React.FC = () => {
  return (
    <nav className="h-full bg-base-300 flex flex-col p-4">
      <div className="mb-8">
        <img src="/your-logo.png" alt="Logo" className="h-12 w-auto" />
      </div>
      <ul className="space-y-4">
        {navItems.map((item, index) => (
          <li key={index}>
            <Link href={item.href} className="btn btn-primary">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SideNavbar;
