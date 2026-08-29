import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/brand/mark.png"
      alt=""
      width={size}
      height={size}
      className={cn("object-contain drop-shadow-[0_8px_18px_rgba(8,30,44,0.35)]", className)}
    />
  );
}
