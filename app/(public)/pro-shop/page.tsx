import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Pro Shop",
};

export default function ProShopPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <h1 className="font-heading text-4xl font-semibold">Pro Shop</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Fully stocked pro shop with equipment, apparel, and expert advice from our PGA staff.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          "Golf equipment & accessories",
          "Apparel for men and women",
          "Gift items and Oak Tree merchandise",
          "Club fitting and recommendations",
        ].map((item) => (
          <Card key={item}>
            <CardContent className="pt-6 font-medium">{item}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <a href={SITE.phoneHref}>Call {SITE.phone}</a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </div>
  );
}
