import Image from "next/image";

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
  if (!src) return null;
  return (
    <Image src={src} alt={alt} fill={fill} sizes={sizes} className={className} unoptimized />
  );
}
