import { Resend } from "resend";
import { format, parse } from "date-fns";
import { SITE } from "@/lib/constants";
import type { Booking } from "@/lib/types/database";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function formatBookingDate(date: string): string {
  return format(parse(date, "yyyy-MM-dd", new Date()), "EEEE, MMMM d, yyyy");
}

function formatBookingTime(time: string): string {
  return format(parse(time.slice(0, 8), "HH:mm:ss", new Date()), "h:mm a");
}

function cartLabel(preference: string): string {
  if (preference === "walking") return "Walking";
  if (preference === "cart") return "Cart";
  return "Not specified";
}

export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  if (!resend || !booking.customer_email) return;

  const from = process.env.RESEND_FROM_EMAIL ?? "bookings@oaktreegolf.net";

  await resend.emails.send({
    from,
    to: booking.customer_email,
    subject: "Your Oak Tree Golf Course Tee Time",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h1 style="color: #1a3d2e;">Your tee time is confirmed</h1>
        <p>Hi ${booking.customer_name},</p>
        <p>Thank you for booking at Oak Tree Golf Course. Here are your reservation details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr><td style="padding: 8px 0;"><strong>Date</strong></td><td>${formatBookingDate(booking.booking_date)}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Time</strong></td><td>${formatBookingTime(booking.tee_time)}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Players</strong></td><td>${booking.players}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Preference</strong></td><td>${cartLabel(booking.cart_preference)}</td></tr>
        </table>
        <p><strong>Payment is due at the course.</strong></p>
        <p>
          ${SITE.name}<br/>
          ${SITE.address}<br/>
          ${SITE.phone}
        </p>
        <p>We look forward to seeing you on the course!</p>
      </div>
    `,
  });
}

export async function sendStaffBookingNotification(booking: Booking): Promise<void> {
  const staffEmail = process.env.STAFF_NOTIFICATION_EMAIL;
  if (!resend || !staffEmail) return;

  const from = process.env.RESEND_FROM_EMAIL ?? "bookings@oaktreegolf.net";

  await resend.emails.send({
    from,
    to: staffEmail,
    subject: `New online booking — ${formatBookingDate(booking.booking_date)} ${formatBookingTime(booking.tee_time)}`,
    html: `
      <div style="font-family: sans-serif;">
        <h2>New Online Booking</h2>
        <p><strong>${booking.customer_name}</strong> — ${booking.players} player(s)</p>
        <p>${formatBookingDate(booking.booking_date)} at ${formatBookingTime(booking.tee_time)}</p>
        <p>Phone: ${booking.customer_phone ?? "N/A"}</p>
        <p>Email: ${booking.customer_email ?? "N/A"}</p>
        ${booking.notes ? `<p>Notes: ${booking.notes}</p>` : ""}
      </div>
    `,
  });
}
