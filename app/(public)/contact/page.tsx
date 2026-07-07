import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <h1 className="font-heading text-4xl font-semibold">Contact Us</h1>
      <p className="mt-2 text-muted-foreground">We&apos;d love to hear from you.</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{SITE.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <a href={SITE.phoneHref} className="font-medium text-primary hover:underline">
                  {SITE.phone}
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${SITE.email}`} className="font-medium text-primary hover:underline">
                  {SITE.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours</p>
                <p className="font-medium">{SITE.hours}</p>
              </div>
            </CardContent>
          </Card>
          <Button asChild size="lg">
            <Link href="/book">Book a Tee Time</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-heading text-2xl font-semibold">Send a Message</h2>
            <form action={`mailto:${SITE.email}`} method="post" encType="text/plain" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" rows={5} required />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 overflow-hidden rounded-xl border">
        <iframe
          title="Oak Tree Golf Course Map"
          src={SITE.mapEmbed}
          className="h-[400px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
