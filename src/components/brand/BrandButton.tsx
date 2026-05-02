import Link from "next/link";
import { BTN_PRIMARY, BTN_SECONDARY, BTN_GHOST } from "@/lib/brand";
import type { CSSProperties } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size    = "sm" | "md" | "lg";

const SIZES: Record<Size, CSSProperties> = {
  sm: { padding: "8px 18px",  fontSize: 13 },
  md: { padding: "12px 24px", fontSize: 15 },
  lg: { padding: "15px 32px", fontSize: 17 },
};

const BASE: CSSProperties = {
  display:        "inline-flex",
  alignItems:     "center",
  justifyContent: "center",
  gap:            8,
  textDecoration: "none",
  cursor:         "pointer",
  transition:     "opacity 0.15s, box-shadow 0.15s",
  whiteSpace:     "nowrap",
  letterSpacing:  "-0.01em",
  fontFamily:     "inherit",
};

interface BrandButtonProps {
  children: React.ReactNode;
  href?:    string;
  onClick?: () => void;
  variant?: Variant;
  size?:    Size;
  style?:   CSSProperties;
  type?:    "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function BrandButton({
  children,
  href,
  onClick,
  variant = "primary",
  size    = "md",
  style,
  type    = "button",
  disabled,
}: BrandButtonProps) {
  const variantStyle = variant === "primary"   ? BTN_PRIMARY
                     : variant === "secondary" ? BTN_SECONDARY
                     :                           BTN_GHOST;

  const combined: CSSProperties = { ...BASE, ...SIZES[size], ...variantStyle, ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}), ...style };

  if (href) {
    return (
      <Link href={href} style={combined}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={combined}>
      {children}
    </button>
  );
}
