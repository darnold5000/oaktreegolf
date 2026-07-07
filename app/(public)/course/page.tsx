import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GALLERY_IMAGES, HERO_IMAGE } from "@/lib/constants";

export const metadata = {
  title: "Course",
};

export default function CoursePage() {
  return (
    <div>
      <section className="relative h-[38vh] min-h-[240px] sm:min-h-[300px]">
        <Image
          src={HERO_IMAGE}
          alt="Oak Tree Golf Course fairway and water hazard at sunrise"
          fill
          priority
          quality={95}
          className="object-cover object-center brightness-115 contrast-[1.03] saturate-110"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 lg:px-8">
          <h1 className="font-heading text-4xl font-semibold text-primary-foreground sm:text-5xl">
            The Course
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Oak Tree Golf Course is an 18-hole championship Pete Dye layout open to the public on
              the west side of Indianapolis in Plainfield, Indiana.
            </p>
            <p>
              Originally opened in 1962 as a 9-hole course and expanded to 18 holes in 1975, Oak Tree
              features tree-lined fairways, undulating greens, and water in play on five holes.
            </p>
            <p>
              Par 72 from the back tees at 6,479 yards. Whether you&apos;re a seasoned golfer or just
              starting out, Oak Tree offers a memorable round for every skill level.
            </p>
            <Button asChild>
              <Link href="/scorecard">View Scorecard</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {GALLERY_IMAGES.slice(0, 2).map((image) => (
              <div key={image.src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image src={image.src} alt={image.alt} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Designer", value: "Pete Dye" },
            { title: "Holes", value: "18 Championship" },
            { title: "Access", value: "Public Welcome" },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="mt-1 text-xl font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
