import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export const BrandLogo = ({
  className = "",
  priority = false,
}: BrandLogoProps) => (
  <Image
    src="/branding/minimaker-logo-color.png"
    alt="Mini Maker Labs"
    width={704}
    height={303}
    priority={priority}
    className={`h-auto max-w-full object-contain ${className}`}
  />
);
