import Image from "next/image";

const logos = {
  default: { src: "/logo.png", width: 813, height: 417 },
  footer: { src: "/logo-footer.png", width: 1010, height: 513 },
};

export function Logo({ height = 52, eager = false, variant = "default" }: { height?: number; eager?: boolean; variant?: keyof typeof logos }) {
  const logo = logos[variant];
  return <Image className="logo-img" src={logo.src} alt="Afzal Enterprises — Furnish Your Life" width={Math.round(height * logo.width / logo.height)} height={height} loading={eager ? "eager" : undefined} />;
}
