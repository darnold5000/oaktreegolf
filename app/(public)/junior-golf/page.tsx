import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Junior Golf",
};

export default function JuniorGolfPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <h1 className="font-heading text-4xl font-semibold">Junior Golf</h1>
      <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
        Pine Tree staff is committed to growing the game of golf.
      </p>

      <Card className="mt-8">
        <CardContent className="space-y-4 pt-6 text-muted-foreground leading-relaxed">
          <p>
            We are the home course for Avon Middle School North, Avon Middle School South, Kingsway,
            and St. Susanna golf teams.
          </p>
          <p>
            We proudly promote and participate in The First Tee of Indiana Program with three
            sessions each year. For available sessions please visit{" "}
            <a
              href="https://www.firstteeindiana.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              firstteeindiana.org
            </a>{" "}
            (we are under the Indianapolis grouping).
          </p>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <a href={SITE.phoneHref}>Call the Pro Shop</a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={`mailto:${SITE.email}`}>Email Us</a>
        </Button>
      </div>
    </div>
  );
}
