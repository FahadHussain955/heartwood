import { ShoppingBag } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa";
import { SiFacebook, SiInstagram, SiPinterest, SiTiktok, SiYoutube } from "react-icons/si";
import type { IconType } from "react-icons";

export const socialIcons: Record<string, IconType> = {
  Instagram: SiInstagram,
  Facebook: SiFacebook,
  TikTok: SiTiktok,
  Pinterest: SiPinterest,
  YouTube: SiYoutube,
  LinkedIn: FaLinkedinIn,
  Daraz: ShoppingBag,
};
export const socialColors: Record<string, string> = {
  Instagram: "#E4405F",
  Facebook: "#1877F2",
  TikTok: "#25F4EE",
  Pinterest: "#E60023",
  YouTube: "#FF0000",
  LinkedIn: "#0A66C2",
  Daraz: "#F85606",
};

