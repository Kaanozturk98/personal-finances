import Link, { LinkProps } from "next/link";
import { Url } from "next/dist/shared/lib/router/router";
import clsx from "clsx";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface ArrowIconProps extends React.SVGProps<SVGSVGElement> {}

function ArrowIcon(props: ArrowIconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m11.5 6.5 3 3.5m0 0-3 3.5m3-3.5h-9"
      />
    </svg>
  );
}

type ButtonVariant = "primary" | "secondary" | "filled" | "outline" | "text";

interface CommonButtonProps {
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
  arrow?: "left" | "right";
}

interface ButtonAnchorProps extends CommonButtonProps, Omit<LinkProps, "href"> {
  href: Url;
}
type ButtonElementProps = CommonButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonProps = ButtonAnchorProps | ButtonElementProps;

const variantStyles = {
  primary:
    "rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-1 dark:ring-inset dark:ring-emerald-400/20 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-300 dark:hover:ring-emerald-300",
  secondary:
    "rounded-full bg-zinc-100 py-1 px-3 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:ring-1 dark:ring-inset dark:ring-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
  filled:
    "rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-400",
  outline:
    "rounded-full py-1 px-3 text-zinc-700 ring-1 ring-inset ring-zinc-900/10 hover:bg-zinc-900/2.5 hover:text-zinc-900 dark:text-zinc-400 dark:ring-white/10 dark:hover:bg-white/5 dark:hover:text-white",
  text: "text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-500",
};

function AnchorButton({ className, children, ...props }: ButtonAnchorProps) {
  return (
    <Link legacyBehavior {...props}>
      <a className={className}>{children}</a>
    </Link>
  );
}

function RegularButton({ className, children, ...props }: ButtonElementProps) {
  return (
    <button {...props} className={className}>
      {children}
    </button>
  );
}

export function Button({
  variant = "primary",
  className,
  children,
  arrow,
  ...props
}: ButtonProps) {
  const isAnchor = !!(props as ButtonAnchorProps).href;

  className = clsx(
    "inline-flex gap-0.5 justify-center overflow-hidden text-sm font-medium transition",
    variantStyles[variant],
    className
  );

  let arrowIcon = (
    <ArrowIcon
      className={clsx(
        "mt-0.5 h-5 w-5",
        variant === "text" && "relative top-px",
        arrow === "left" && "-ml-1 rotate-180",
        arrow === "right" && "-mr-1"
      )}
    />
  );

  return isAnchor ? (
    <AnchorButton className={className} {...(props as ButtonAnchorProps)}>
      {arrow === "left" && arrowIcon}
      {children}
      {arrow === "right" && arrowIcon}
    </AnchorButton>
  ) : (
    <RegularButton className={className} {...(props as ButtonElementProps)}>
      {arrow === "left" && arrowIcon}
      {children}
      {arrow === "right" && arrowIcon}
    </RegularButton>
  );
}
