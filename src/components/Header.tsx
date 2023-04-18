"use client";

import { forwardRef, Ref } from "react";
import Link from "next/link";
import clsx from "clsx";
import { motion, MotionStyle, useScroll, useTransform } from "framer-motion";
import { ModeToggle } from "./ModeToggle";

import { Button } from "./Button";
import { Logo } from "./Logo";
import {
  MobileNavigation,
  useIsInsideMobileNavigation,
} from "./MobileNavigation";
import { useMobileNavigationStore } from "./MobileNavigation";
import { TopLevelNavItemProps } from "@component/types";

function TopLevelNavItem({ href, children }: TopLevelNavItemProps) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm leading-5 text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}

interface HeaderProps {
  className?: string;
}

interface MobileNavigationStore {
  isOpen: boolean;
}
export const Header = forwardRef(function Header(
  { className }: HeaderProps,
  ref: Ref<HTMLDivElement>
) {
  let { isOpen: mobileNavIsOpen } =
    useMobileNavigationStore() as MobileNavigationStore;
  let isInsideMobileNavigation = useIsInsideMobileNavigation();

  let { scrollY } = useScroll();
  let bgOpacityLight = useTransform(scrollY, [0, 72], [0.5, 0.9]);
  let bgOpacityDark = useTransform(scrollY, [0, 72], [0.2, 0.8]);

  return (
    <motion.div
      ref={ref}
      className={clsx(
        className,
        "fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:left-72 lg:z-30 lg:px-8 xl:left-80",
        !isInsideMobileNavigation &&
          "backdrop-blur-sm dark:backdrop-blur lg:left-72 xl:left-80",
        isInsideMobileNavigation
          ? "bg-white dark:bg-zinc-900"
          : "bg-white/[var(--bg-opacity-light)] dark:bg-zinc-900/[var(--bg-opacity-dark)]"
      )}
      style={
        {
          "--bg-opacity-light": bgOpacityLight,
          "--bg-opacity-dark": bgOpacityDark,
        } as MotionStyle
      }
    >
      <div
        className={clsx(
          "absolute inset-x-0 top-full h-px transition",
          (isInsideMobileNavigation || !mobileNavIsOpen) &&
            "bg-zinc-900/7.5 dark:bg-white/7.5"
        )}
      />
      <div className="hidden lg:block lg:max-w-md lg:flex-auto"></div>
      <div className="flex items-center gap-5 lg:hidden">
        <MobileNavigation />
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
      </div>
      <div className="flex items-center gap-5">
        <nav className="hidden md:block">
          <ul role="list" className="flex items-center gap-8">
            <TopLevelNavItem href="https://geonode.com/">
              Homepage
            </TopLevelNavItem>
            <TopLevelNavItem href="https://geonode.com/contact/">
              Support
            </TopLevelNavItem>
          </ul>
        </nav>
        <div className="hidden md:block md:h-5 md:w-px md:bg-zinc-900/10 md:dark:bg-white/15" />
        <div className="flex gap-4">
          <ModeToggle />
        </div>
        <div className="hidden min-[416px]:contents">
          <Button href="https://app.geonode.com/">Sign in</Button>
        </div>
      </div>
    </motion.div>
  );
});
