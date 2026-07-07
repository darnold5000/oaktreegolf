import Link from "next/link";
import { RateCard } from "@/components/public/RateCard";
import { Button } from "@/components/ui/button";
import { DAILY_RATES, PASS_RATES, RANGE_RATES, SITE } from "@/lib/constants";

export const metadata = {
  title: "Rates",
};

export default function RatesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-heading text-4xl font-semibold">2025 Rates</h1>
        <p className="mt-2 text-muted-foreground">Daily play, season passes, and driving range pricing.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <RateCard title="Daily Play" rates={DAILY_RATES} />
        <RateCard title="Passes" rates={PASS_RATES} />
        <RateCard title="Driving Range" rates={RANGE_RATES} />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/book">Book a Tee Time</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={SITE.phoneHref}>Call the Pro Shop</a>
        </Button>
      </div>
    </div>
  );
}
