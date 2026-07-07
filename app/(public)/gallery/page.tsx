import Image from "next/image";
import { GALLERY_IMAGES } from "@/lib/constants";

export const metadata = {
  title: "Gallery",
};

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <h1 className="mb-8 font-heading text-4xl font-semibold">Photo Gallery</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {GALLERY_IMAGES.map((image) => (
          <div key={image.src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              quality={90}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
