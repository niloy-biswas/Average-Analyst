import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Renders marketingPrimaryCta() as an internal Link or an external <a> (mailto). */
export function PrimaryCta({
  href,
  label,
  external,
  className,
  iconClassName = "h-4 w-4",
  onClick,
}: {
  href: string;
  label: string;
  external: boolean;
  className: string;
  iconClassName?: string;
  onClick?: () => void;
}) {
  const children = (
    <>
      {label}
      <ArrowRight className={iconClassName} />
    </>
  );

  if (external) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
