import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

const ICON_SIZES = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-20 w-20",
} as const;

const WORDMARK_HEIGHTS = {
  sm: "h-5",
  md: "h-6",
  lg: "h-9",
  xl: "h-14",
} as const;

/** Source logo is 2172x724 (wordmark) and 378x378 (icon), see public/brand. */
export function BrandMark({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: keyof typeof ICON_SIZES;
}) {
  if (!showWordmark) {
    return (
      <span className={cn("inline-flex items-center shrink-0", ICON_SIZES[size], className)}>
        <Image
          src="/brand/evid-icon-navy.png"
          alt={BRAND.name}
          width={378}
          height={378}
          className="h-full w-full object-contain dark:hidden"
          priority
        />
        <Image
          src="/brand/evid-icon-white.png"
          alt={BRAND.name}
          width={378}
          height={378}
          className="hidden h-full w-full object-contain dark:block"
          priority
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/brand/evid-mark-navy.png"
        alt={BRAND.name}
        width={2172}
        height={724}
        className={cn(WORDMARK_HEIGHTS[size], "w-auto dark:hidden")}
        priority
      />
      <Image
        src="/brand/evid-mark-white.png"
        alt={BRAND.name}
        width={2172}
        height={724}
        className={cn(WORDMARK_HEIGHTS[size], "hidden w-auto dark:block")}
        priority
      />
    </span>
  );
}
