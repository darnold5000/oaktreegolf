import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Outings",
};

export default function OutingsPage() {
  return (
    <div>
      <section className="bg-primary px-4 py-16 text-primary-foreground lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Golf Outings</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
            Whether you are hosting 16 players or 144, Pine Tree Golf Course has a package to meet
            your needs.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            If you are hosting a charity outing, our expertise will help you reach your goals. Oak
            Tree is ideal for corporate outings, charity events, leagues, and family gatherings.
          </p>
          <Card>
            <CardContent className="space-y-3 pt-6">
              <h2 className="font-semibold">Standard Outing Package Includes:</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Green fees & cart</li>
                <li>Prize fund</li>
                <li>Beverage cart(s)</li>
                <li>Driving range</li>
                <li>Computerized scorecards & scoreboards</li>
                <li>Complete tournament set-up</li>
              </ul>
              <p className="text-sm text-muted-foreground">Meals also available for an additional fee.</p>
            </CardContent>
          </Card>
          <Button asChild size="lg">
            <a href={SITE.phoneHref}>Call the Pro Shop</a>
          </Button>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-heading text-2xl font-semibold">Outing Inquiry</h2>
            <form action={`mailto:${SITE.email}`} method="post" encType="text/plain" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Event Details</Label>
                <Textarea id="details" name="details" rows={4} placeholder="Date, group size, format..." />
              </div>
              <Button type="submit" className="w-full">
                Send Inquiry
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
