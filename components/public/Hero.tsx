import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HERO_IMAGE, SITE } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt="Oak Tree Golf Course"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
      <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-4 py-16 lg:px-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/80">
          Plainfield, Indiana
        </p>
        <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
          {SITE.tagline}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90 sm:text-xl">
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
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Link href="/rates">View Rates</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
