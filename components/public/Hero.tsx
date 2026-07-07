import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HERO_IMAGE, SITE } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative min-h-[55vh] overflow-hidden sm:min-h-[65vh] lg:min-h-[72vh]">
      <Image
        src={HERO_IMAGE}
        alt="Oak Tree Golf Course fairway and water hazard at sunrise"
        fill
        priority
        quality={95}
        className="object-cover object-center brightness-105"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
      <div className="relative mx-auto flex min-h-[55vh] max-w-7xl flex-col justify-center px-4 py-16 sm:min-h-[65vh] lg:min-h-[72vh] lg:px-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/90">
          Plainfield, Indiana
        </p>
        <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight text-primary-foreground drop-shadow-sm sm:text-5xl lg:text-6xl">
          {SITE.tagline}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-primary-foreground/95 drop-shadow-sm sm:text-xl">
          {SITE.subtagline}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary" className="text-base">
            <Link href="/book">Book a Tee Time</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/20"
          >
            <Link href="/rates">View Rates</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
