import clsx from "clsx";
import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";

const variants: Record<string, string> = {
  primary: "btn btn-primary",
  secondary: "btn border border-blue-500/60 text-blue-300 bg-transparent hover:bg-blue-500/10",
  ghost: "btn btn-ghost",
  danger: "btn bg-red-600 hover:bg-red-700 text-white",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  asChild?: boolean;
  children: ReactNode;
};

export function Button({ variant = "primary", className, asChild, children, type = "button", ...rest }: Props) {
  const cls = clsx(variants[variant] || variants.primary, className);
  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<{ className?: string }>, {
      className: clsx(cls, (children as ReactElement<{ className?: string }>).props.className),
    });
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
