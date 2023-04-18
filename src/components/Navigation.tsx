"use client";

import { useRef, useEffect, ClassAttributes, HTMLAttributes } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Disclosure } from "@headlessui/react";

import { useIsInsideMobileNavigation } from "./MobileNavigation";
import { Tag } from "./Tag";
import { Page, TopLevelNavItemProps } from "@component/types";

function useInitialValue(value: (string | null)[], condition = true) {
  let initialValue = useRef(value).current;
  return condition ? initialValue : value;
}

function TopLevelNavItem({ href, children }: TopLevelNavItemProps) {
  return (
    <li className="md:hidden">
      <Link
        href={href}
        className="text-md block py-1 text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}

const notActiveItemsCommonClasses =
  "transition text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded hover:bg-zinc-800/2.5 dark:hover:bg-white/2.5";

interface NavLinkProps {
  href: string;
  tag?: string;
  active?: boolean;
  children: React.ReactNode;
  activePageClasses?: string;
  isAdvanced?: boolean;
}

function NavLink({
  href,
  tag,
  active,
  children,
  activePageClasses,
}: NavLinkProps) {
  let tagColor = "zinc";
  switch (String(tag).toLowerCase()) {
    case "advanced":
      tagColor = "amber";
      break;

    case "put":
      tagColor = "amber";
      break;

    case "post":
      tagColor = "sky";
      break;

    case "get":
      tagColor = "emerald";
      break;
  }
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex justify-between gap-2 py-1 pr-3 pl-1 text-xs font-semibold transition",
        active ? activePageClasses : notActiveItemsCommonClasses
      )}
    >
      <span className="truncate">{children}</span>
      {tag && (
        <Tag variant="small" color={tagColor}>
          {tag}
        </Tag>
      )}
    </Link>
  );
}
function AlignmentLine() {
  return (
    <motion.div
      layout
      className="absolute inset-y-0 left-0 w-px bg-zinc-900/10 dark:bg-white/5"
    />
  );
}

interface DisclosureIconProps {
  open: boolean;
}

function DisclosureIcon({ open }: DisclosureIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={clsx(
        open && "rotate-90",
        "mr-2 h-2.5 w-2.5 flex-shrink-0 transform transition-colors duration-150 ease-in-out"
      )}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        points="7 2 17 12 7 22"
      ></polyline>
    </svg>
  );
}

interface NavigationGroupPage {
  title: string;
  href: string;
  parents?: NavigationGroupGroup[];
}

interface NavigationGroupLink {
  title: string;
  href: string;
  tag?: string;
  isAdvanced?: boolean;
}

interface NavigationGroupCategory {
  title: string;
  href?: string;
  links?: NavigationGroupLink[];
}

interface NavigationGroupGroup {
  title: string;
  href?: string;
  links?: NavigationGroupLink[];
  categories?: NavigationGroupCategory[];
}

interface NavigationGroupProps {
  group: NavigationGroupGroup;
  className?: string;
  currentPage?: NavigationGroupPage;
  openedRef: React.MutableRefObject<HTMLButtonElement | null>;
  buttonRefs: React.MutableRefObject<
    | (HTMLButtonElement | null)[]
    | ((instance: HTMLButtonElement | null) => void)[]
  >;
  clickRecent: (index: number) => void;
  allDisclosures: (
    | NavigationGroupGroup
    | NavigationGroupCategory
    | undefined
  )[];
}

function NavigationGroup({
  group,
  className,
  currentPage,
  openedRef,
  buttonRefs,
  clickRecent,
  allDisclosures,
}: NavigationGroupProps) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  const isInsideMobileNavigation = useIsInsideMobileNavigation();
  const [pathname] = useInitialValue([usePathname()], isInsideMobileNavigation);

  const isActive = (page: NavigationGroupPage | NavigationGroupCategory) =>
    page.href === pathname;
  const activePageClasses =
    "rounded bg-zinc-800/5 text-emerald-700 dark:bg-white/5 dark:text-emerald-400";

  return (
    <li className={clsx("relative mt-2", className)}>
      {!!group.href ? (
        <Link
          href={group.href}
          aria-current={isActive(group) ? "page" : undefined}
        >
          <motion.h2
            layout="position"
            className={clsx(
              "py-1 pr-3 pl-1 text-xs font-bold transition",
              isActive(group) ? activePageClasses : notActiveItemsCommonClasses
            )}
          >
            {group.title}
          </motion.h2>
        </Link>
      ) : (
        <>
          {!!group.links && (
            <Disclosure
              as="div"
              defaultOpen={
                currentPage?.parents?.[0]?.title === group.title || false
              }
            >
              {({ open }) => (
                <>
                  <Disclosure.Button
                    className={clsx(
                      "flex w-full items-center text-left",
                      notActiveItemsCommonClasses
                    )}
                    data-value={open}
                    ref={(ref) => {
                      if (open) openedRef.current = ref;

                      const idx = allDisclosures.findIndex(
                        (e) => JSON.stringify(e) === JSON.stringify(group)
                      );
                      buttonRefs.current[idx] = ref;
                    }}
                    onClick={() => {
                      const idx = allDisclosures.findIndex(
                        (e) => JSON.stringify(e) === JSON.stringify(group)
                      );
                      clickRecent(idx);
                    }}
                  >
                    <motion.h2
                      layout="position"
                      className={clsx(
                        "flex-1 py-1 pr-3 pl-1 text-xs font-bold transition"
                      )}
                    >
                      {group.title}
                    </motion.h2>
                    <DisclosureIcon open={open} />
                  </Disclosure.Button>

                  <AnimatePresence mode="popLayout" initial={false}>
                    <Disclosure.Panel>
                      <motion.div
                        key={group.title}
                        className="relative mt-1 ml-1 pl-3"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          transition: { delay: 0.15 },
                        }}
                        exit={{
                          opacity: 0,
                          transition: { duration: 0.15 },
                        }}
                      >
                        <AlignmentLine />
                        <ul role="list" className="border-l border-transparent">
                          {(group.links as NavigationGroupPage[]).map(
                            (link) => (
                              <li key={link.title} className="relative mt-2">
                                <Link
                                  href={link.href}
                                  aria-current={
                                    isActive(link) ? "page" : undefined
                                  }
                                >
                                  <motion.h3
                                    layout="position"
                                    className={clsx(
                                      "py-1 pr-3 pl-1 text-xs font-bold transition",
                                      isActive(link)
                                        ? activePageClasses
                                        : notActiveItemsCommonClasses
                                    )}
                                  >
                                    {link.title}
                                  </motion.h3>
                                </Link>
                              </li>
                            )
                          )}
                        </ul>
                      </motion.div>
                    </Disclosure.Panel>
                  </AnimatePresence>
                </>
              )}
            </Disclosure>
          )}

          {!!group.categories && (
            <>
              <div
                className={clsx(
                  "flex w-full items-center text-left",
                  notActiveItemsCommonClasses
                )}
              >
                <motion.h2
                  layout="position"
                  className={clsx("flex-1 py-1 pr-3 pl-1 text-xs font-bold")}
                >
                  {group.title}
                </motion.h2>
              </div>
              {!!group.categories && (
                <>
                  <div className="relative mt-1 ml-1 pl-3">
                    <AlignmentLine />
                    <ul role="list" className="border-l border-transparent">
                      {group.categories.map((category) => (
                        <li
                          key={category.title}
                          className={clsx("relative mt-2", className)}
                        >
                          {!!category.href ? (
                            <motion.h3
                              layout="position"
                              className={clsx(
                                "text-xs font-semibold",
                                notActiveItemsCommonClasses
                              )}
                            >
                              <NavLink
                                href={category.href}
                                active={isActive(category)}
                              >
                                {category.title}
                              </NavLink>
                            </motion.h3>
                          ) : (
                            <Disclosure
                              as="div"
                              defaultOpen={
                                (currentPage?.parents?.[0]?.title ===
                                  group.title &&
                                  currentPage?.parents?.[1]?.title ===
                                    category.title) ||
                                false
                              }
                            >
                              {({ open }) => (
                                <>
                                  <Disclosure.Button
                                    className={clsx(
                                      "flex w-full items-center text-left",
                                      notActiveItemsCommonClasses
                                    )}
                                    data-value={open}
                                    ref={(ref) => {
                                      if (open) openedRef.current = ref;

                                      const idx = allDisclosures.findIndex(
                                        (e) =>
                                          JSON.stringify(e) ===
                                          JSON.stringify(category)
                                      );
                                      buttonRefs.current[idx] = ref;
                                    }}
                                    onClick={() => {
                                      const idx = allDisclosures.findIndex(
                                        (e) =>
                                          JSON.stringify(e) ===
                                          JSON.stringify(category)
                                      );
                                      clickRecent(idx);
                                    }}
                                  >
                                    <motion.h3
                                      layout="position"
                                      className={clsx(
                                        "flex-1 py-1 pr-3 pl-1 text-xs font-semibold"
                                      )}
                                    >
                                      {category.title}
                                    </motion.h3>
                                    <DisclosureIcon open={open} />
                                  </Disclosure.Button>
                                  {!!category.links && (
                                    <AnimatePresence
                                      mode="popLayout"
                                      initial={false}
                                    >
                                      <Disclosure.Panel>
                                        <motion.div
                                          key={category.title}
                                          className="relative mt-1 pl-2"
                                          initial={{ opacity: 0 }}
                                          animate={{
                                            opacity: 1,
                                            transition: { delay: 0.15 },
                                          }}
                                          exit={{
                                            opacity: 0,
                                            transition: { duration: 0.15 },
                                          }}
                                        >
                                          <AlignmentLine />
                                          <ul
                                            role="list"
                                            className="border-l border-transparent"
                                          >
                                            {category.links.map((link) => (
                                              <li
                                                key={link.title}
                                                className="relative"
                                              >
                                                <NavLink
                                                  href={link.href}
                                                  active={isActive(link)}
                                                  isAdvanced={link.isAdvanced}
                                                  activePageClasses={
                                                    activePageClasses
                                                  }
                                                  tag={link.tag}
                                                >
                                                  {link.title}
                                                </NavLink>
                                              </li>
                                            ))}
                                          </ul>
                                        </motion.div>
                                      </Disclosure.Panel>
                                    </AnimatePresence>
                                  )}
                                </>
                              )}
                            </Disclosure>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </li>
  );
}

export const navigation = [
  {
    title: "Introduction",
    href: "/",
  },
  {
    title: "Getting Started",
    links: [
      { title: "Our Services", href: "/getting-started/our-services" },
      {
        title: "How Can I start?",
        href: "/getting-started/how-can-I-start-using-your-services",
      },
      {
        title: "How Can I subscribe?",
        href: "/getting-started/how-can-I-subscribe",
      },
      { title: "Dashboard", href: "/getting-started/dashboard" },
    ],
  },
  {
    title: "Proxy Services",
    categories: [
      {
        title: "Core Concepts",
        links: [
          { title: "What is a proxy?", href: "/proxy/what-is-a-proxy" },
          {
            title: "What does thread mean?",
            href: "/proxy/what-does-thread-mean",
          },
          { title: "What does port mean?", href: "/proxy/what-does-port-mean" },
          {
            title: "What is an IP address?",
            href: "/proxy/what-is-ip-address",
          },
          {
            title: "How proxies work?",
            href: "/proxy/how-proxies-work",
            tag: "Advanced",
          },
          {
            title: "Sticky vs Rotating",
            href: "/proxy/differences-between-sticky-and-rotating-proxies",
            tag: "Advanced",
          },
          {
            title: "Multi thread usage",
            href: "/proxy/why-am-i-using-multiple-threads-on-a-single-web-page",
            tag: "Advanced",
          },
          {
            title: "Thread vs Port vs IP",
            href: "/proxy/thread-vs-port-vs-ip-address",
            tag: "Advanced",
          },
          {
            title: "What is geo targeting?",
            href: "/proxy/what-is-geo-targeting",
            tag: "Advanced",
          },
          {
            title: "What is ISP targeting?",
            href: "/proxy/what-is-isp-targeting",
            tag: "Advanced",
          },
        ],
      },
      {
        title: "API",
        links: [
          {
            title: "Creating New Sticky Session",
            href: "/proxy/creating-new-sticky-session",
            tag: "GET",
          },
          {
            title: "List All Active Sessions",
            href: "/proxy/list-all-active-sessions",
            tag: "GET",
          },
          {
            title: "Setting Connection Timeout",
            href: "/proxy/setting-connection-timeout",
            tag: "GET",
          },
          {
            title: "Specifiying Session Lifetime",
            href: "/proxy/specifying-session-lifetime",
            tag: "GET",
          },
          {
            title: "How to do Geo-targeting?",
            href: "/proxy/how-to-do-geo-targeting",
            tag: "GET",
          },
          {
            title: "Obtaining Sticky Session Information",
            href: "/proxy/obtaining-sticky-session-information",
            tag: "GET",
          },
          {
            title: "Releasing a Sticky Session",
            href: "/proxy/releasing-a-sticky-session",
            tag: "PUT",
          },
          {
            title: "Understanding Response Codes",
            href: "/proxy/understanding-response-codes",
          },
        ],
      },
      {
        title: "FAQs and Troubleshooting",
        links: [
          { title: "Frequently Asked Questions", href: "/proxy/faqs" },
          {
            title: "Checking Proxy Connection",
            href: "/proxy/checking-proxy-connection",
          },
          {
            title: "Where is my API credentials?",
            href: "/proxy/where-is-my-API-credentials",
          },
          { title: "Supported Protocols", href: "/proxy/supported-protocols" },
          {
            title: "Switching Payment Method",
            href: "/proxy/switching-payment-method",
          },
        ],
      },
    ],
  },
  {
    title: "Scraper",
    categories: [
      {
        title: "Core Concepts",
        links: [
          { title: "How Scrapers Work?", href: "/scraper/how-scrapers-work" },
          {
            title: "How Scrapers Can Be Utilized?",
            href: "/scraper/how-scrapers-can-be-utilized",
          },
        ],
      },
      {
        title: "API",
        links: [
          { title: "Realtime", href: "/scraper/realtime", tag: "POST" },
          { title: "Callback", href: "/scraper/callback", tag: "POST" },
          { title: "Get Status", href: "/scraper/get-status", tag: "GET" },
          { title: "Actions ", href: "/scraper/actions", tag: "Parameter" },
        ],
      },
    ],
  },
];

const toBoolean = (value: string) => (value == "false") != Boolean(value);

// Take a look to the types
export const allPages: Page[] | any = navigation.flatMap((group) => {
  if (!!group.links) {
    return group.links.map((link) => ({ ...link, parents: [group] }));
  }

  if (!group.categories) return { ...group, parents: [] };

  return group.categories.flatMap((category) => {
    if (!category.links) return { ...category, parents: [group] } as Page;
    return category.links.map((link) => ({
      ...link,
      parents: [group, category],
    }));
  });
});

export function Navigation(
  props: JSX.IntrinsicAttributes &
    ClassAttributes<HTMLElement> &
    HTMLAttributes<HTMLElement>
) {
  const pathname = usePathname();
  const [currentPage] = allPages.filter((page: Page) => page.href === pathname);

  const buttonRefs = useRef<HTMLButtonElement[]>([]);
  const openedRef = useRef<HTMLButtonElement | null>(null);

  const clickRecent = (index: number) => {
    /* console.log('clicked', index); */
    const clickedButton = buttonRefs.current[index];

    if (clickedButton === openedRef.current) {
      /* console.log('close clicked', index); */
      openedRef.current = null;
      return;
    }
    if (Boolean(openedRef.current?.getAttribute("data-value"))) {
      /* console.log('close current opened'); */
      openedRef.current?.click();
    }
    /* console.log('mark new opened', index); */
    openedRef.current = clickedButton;
  };

  const allDisclosures = navigation
    .flatMap((group) => {
      if (!!group.links) return group as NavigationGroupGroup;
      if (!!group.categories)
        return group.categories as NavigationGroupCategory[];
      return undefined;
    })
    .filter((e) => e);

  useEffect(() => {
    // To close the open disclosure on home page
    let hasParent = false;
    // Find the current page and expand the parent disclosure
    allDisclosures.forEach((disclosure) => {
      if (
        (currentPage?.parents?.length === 1 &&
          JSON.stringify(currentPage?.parents?.[0]) ===
            JSON.stringify(disclosure)) ||
        (currentPage?.parents?.length === 2 &&
          JSON.stringify(currentPage?.parents?.[1]) ===
            JSON.stringify(disclosure))
      ) {
        hasParent = true;

        const currentDisclosureIndex = allDisclosures.findIndex(
          (e) => JSON.stringify(e) === JSON.stringify(disclosure)
        );
        const currentDisclosureButton =
          buttonRefs.current[currentDisclosureIndex];
        if (
          !toBoolean(
            currentDisclosureButton.getAttribute("data-value") as string
          )
        ) {
          currentDisclosureButton.click();
        }
      }
    });
    if (!hasParent) {
      openedRef.current?.click();
    }
  }, [allDisclosures, currentPage?.parents]);

  return (
    <nav {...props}>
      <ul role="list">
        <TopLevelNavItem href="https://geonode.com/">Homepage</TopLevelNavItem>
        <TopLevelNavItem href="https://geonode.com/contact/">
          Support
        </TopLevelNavItem>
        {navigation.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 ? "md:mt-0" : undefined}
            currentPage={currentPage}
            openedRef={openedRef}
            buttonRefs={buttonRefs}
            clickRecent={clickRecent}
            allDisclosures={allDisclosures}
          />
        ))}
      </ul>
    </nav>
  );
}
