import { PRIMARY, SAPPHIRE_PALE } from "@/lib/brand";
import type { CSSProperties } from "react";

interface EyebrowProps {
  children:  React.ReactNode;
  style?:    CSSProperties;
  withDot?:  boolean;
}

export default function Eyebrow({ children, style, withDot }: EyebrowProps) {
  return (
    <div style={{
      display:       "inline-flex",
      alignItems:    "center",
      gap:           6,
      marginBottom:  14,
      ...style,
    }}>
      {withDot && (
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: PRIMARY, flexShrink: 0,
        }} />
      )}
      <span style={{
        fontSize:      11,
        fontWeight:    700,
        letterSpacing: "0.1em",
        textTransform: "uppercase" as const,
        color:         PRIMARY,
        background:    SAPPHIRE_PALE,
        padding:       "4px 10px",
        borderRadius:  20,
      }}>
        {children}
      </span>
    </div>
  );
}
