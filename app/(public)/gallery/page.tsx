import Image from "next/image";
import { GALLERY_IMAGES } from "@/lib/constants";

export const metadata = {
  title: "Gallery",
};

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <h1 className="mb-8 font-heading text-4xl font-semibold">Photo Gallery</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {GALLERY_IMAGES.map((image, index) => (
          <div
            key={image.src}
            className={`overflow-hidden rounded-xl ${index === 0 ? "md:col-span-2" : ""}`}
          >
            <div
              className={`relative w-full overflow-hidden ${
                index === 0 ? "aspect-[21/9] min-h-[280px] md:min-h-[360px]" : "aspect-[4/3] min-h-[280px] md:min-h-[340px]"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                quality={90}
                className="object-cover brightness-105"
                sizes={index === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
