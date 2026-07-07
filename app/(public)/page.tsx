import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/public/Hero";
import { QuickInfoBar } from "@/components/public/QuickInfoBar";
import { RatesPreview } from "@/components/public/RateCard";
import { StatusBanner } from "@/components/public/CourseStatusBadge";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AMENITY_CARDS, GALLERY_IMAGES, SITE } from "@/lib/constants";
import { getCourseStatus } from "@/lib/data";
import { getAvailableSlots, getDayOfWeekInTimezone, getFirstAvailableSlot } from "@/lib/availability";
import { getBookingsForDate } from "@/lib/bookings";
import { getBlockedTimesForDate, getCourseSettings, getDailyHours } from "@/lib/data";
import { formatDateInTimezone } from "@/lib/availability";

export default async function HomePage() {
  const settings = await getCourseSettings();
  const today = formatDateInTimezone(new Date(), settings.timezone);
  const [status] = await Promise.all([getCourseStatus(today)]);
  const dailyHours = await getDailyHours(getDayOfWeekInTimezone(today, settings.timezone));
  const bookings = await getBookingsForDate(today);
  const blocks = await getBlockedTimesForDate(today);
  const slots = getAvailableSlots({
    date: today,
    players: 4,
    settings,
    dailyHours,
    bookings,
    blocks,
  });
  const firstAvailable = getFirstAvailableSlot(slots);

  return (
    <>
      {status.announcement ? <StatusBanner message={status.announcement} /> : null}
      <Hero />
      <QuickInfoBar
        courseStatus={status.course_status}
        rangeStatus={status.range_status}
        cartStatus={status.cart_status}
        firstAvailable={firstAvailable?.time ?? status.first_available_time}
      />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-2 lg:px-8">
        <BookingWidget />
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-semibold">About Oak Tree</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Located on U.S. 40, just 10 minutes west of the Indianapolis International Airport,
              Oak Tree Golf Course is a spectacular Pete Dye layout open to the public. From the
              beautiful 18-hole championship layout to the fully stocked pro shop, Oak Tree is one
              of the finest facilities on the city&apos;s Westside.
            </p>
          </div>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                BW
              </div>
              <div>
                <p className="font-semibold">{SITE.manager}</p>
                <p className="text-sm text-muted-foreground">{SITE.managerTitle}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <RatesPreview />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="mb-8 font-heading text-3xl font-semibold">Course & Amenities</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AMENITY_CARDS.map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-heading text-3xl font-semibold">Photo Gallery</h2>
            <Button asChild variant="outline">
              <Link href="/gallery">View Gallery</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {GALLERY_IMAGES.map((image) => (
              <div key={image.src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  quality={90}
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
