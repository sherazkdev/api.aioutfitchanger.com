import Image from "next/image";
import { normalizePublicImageUrl } from "@/lib/content/publicImageUrl";

/** Remote user/content URLs — always unoptimized to avoid hostname config crashes */
export default function RemoteImage({
  src,
  alt = "",
  className,
  fill,
  sizes,
}: {
  src: string;
  alt?: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
}) {
  const resolved = normalizePublicImageUrl(src);
  if (!resolved) return null;
  return (
    <Image src={resolved} alt={alt} fill={fill} sizes={sizes} className={className} unoptimized />
  );
}
