import Image from "next/image";
import { GALLERY_IMAGES } from "@/lib/constants";

export const metadata = {
  title: "Gallery",
};

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <h1 className="mb-8 font-heading text-4xl font-semibold">Photo Gallery</h1>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {GALLERY_IMAGES.map((image) => (
          <div key={image.src} className="mb-4 break-inside-avoid overflow-hidden rounded-xl">
            <div className="relative aspect-[4/3]">
              <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
