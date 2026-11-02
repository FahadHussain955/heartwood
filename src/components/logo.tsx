import type { CSSProperties } from "react";
import Image from "next/image";

const logos = {
  default: { src: "/logo.svg", width: 2090, height: 1130 },
  footer: { src: "/logo-footer.png", width: 1010, height: 513 },
};

// The SVG is served as-is, at its own 2090px size, and Tailwind's base `img { height: auto }` would show it that big.
// The height is therefore passed to the CSS as --logo-h (see .wordmark .logo-img in globals.css).
export function Logo({ height = 52, eager = false, variant = "default" }: { height?: number; eager?: boolean; variant?: keyof typeof logos }) {
  const logo = logos[variant];
  return <Image className="logo-img" src={logo.src} alt="Afzal Enterprises — Furnish Your Life" width={Math.round(height * logo.width / logo.height)} height={height} loading={eager ? "eager" : undefined} style={{ "--logo-h": `${height}px` } as CSSProperties} />;
}
