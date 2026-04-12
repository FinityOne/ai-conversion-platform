"use client";

import { useRef, useEffect } from "react";
import { formatPhoneInput } from "@/lib/phone";

interface Props {
  value:       string;
  onChange:    (formatted: string) => void;
  /** Style applied to the <input> element — PhoneInput overrides paddingLeft */
  inputStyle?: React.CSSProperties;
  /** Color of the 🇺🇸 +1 prefix text. Defaults to "#78716c" (light theme muted). */
  prefixColor?: string;
  /** Color of the divider line between prefix and input. */
  dividerColor?: string;
  onFocus?:    () => void;
  onBlur?:     () => void;
  onKeyDown?:  (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?:  boolean;
  placeholder?: string;
  id?:         string;
  name?:       string;
}

export default function PhoneInput({
  value,
  onChange,
  inputStyle = {},
  prefixColor   = "#78716c",
  dividerColor  = "rgba(0,0,0,0.1)",
  onFocus,
  onBlur,
  onKeyDown,
  autoFocus,
  placeholder = "(555) 000-0000",
  id,
  name,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      setTimeout(() => ref.current?.focus(), 80);
    }
  }, [autoFocus]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(formatPhoneInput(e.target.value));
  }

  return (
    <div style={{ position: "relative" }}>
      {/* 🇺🇸 +1 prefix */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        display: "flex", alignItems: "center",
        paddingLeft: 13, paddingRight: 10,
        gap: 5, pointerEvents: "none", userSelect: "none", zIndex: 1,
        borderRight: `1px solid ${dividerColor}`,
        marginTop: 1, marginBottom: 1,
      }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>🇺🇸</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: prefixColor, letterSpacing: "0.2px" }}>
          +1
        </span>
      </div>

      <input
        ref={ref}
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        style={{
          ...inputStyle,
          paddingLeft: 68,
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
