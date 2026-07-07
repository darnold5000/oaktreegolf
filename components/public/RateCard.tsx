import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DAILY_RATES } from "@/lib/constants";

export function RateCard({
  title,
  rates,
}: {
  title: string;
  rates: readonly { label: string; price: string; note?: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rates.map((rate) => (
          <div key={rate.label} className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
            <div>
              <p className="font-medium">{rate.label}</p>
              {"note" in rate && rate.note ? (
                <p className="mt-1 text-xs text-muted-foreground">{rate.note}</p>
              ) : null}
            </div>
            <p className="shrink-0 font-semibold text-primary">{rate.price}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RatesPreview() {
  return (
    <section className="bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-semibold">Daily Play Rates</h2>
            <p className="mt-2 text-muted-foreground">2025 rates — payment due at the course</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/rates">View All Rates</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {DAILY_RATES.map((rate) => (
            <Card key={rate.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{rate.label}</p>
                <p className="mt-2 text-3xl font-semibold text-primary">{rate.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
