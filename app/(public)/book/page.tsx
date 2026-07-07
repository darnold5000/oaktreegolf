import { Suspense } from "react";
import { BookingForm } from "@/components/booking/BookingForm";

export const metadata = {
  title: "Book a Tee Time",
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-4xl font-semibold">Book a Tee Time</h1>
        <p className="mt-2 text-muted-foreground">
          Reserve your spot online. Payment is due at the course.
        </p>
      </div>
      <Suspense fallback={<p className="text-center text-muted-foreground">Loading...</p>}>
        <BookingForm />
      </Suspense>
    </div>
  );
}
