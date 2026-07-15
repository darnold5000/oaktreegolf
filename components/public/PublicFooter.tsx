import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <h2 className="font-heading text-2xl font-semibold">{SITE.name}</h2>
          <p className="mt-2 max-w-md text-sm text-primary-foreground/80">
            Located just minutes west of Indianapolis.
            A spectacular Pete Dye layout open to the public.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.slice(0, 6).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-primary-foreground/80 hover:text-primary-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Contact</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>{SITE.address}</li>
            <li>
              <a href={SITE.phoneHref} className="hover:text-primary-foreground">
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-primary-foreground">
                {SITE.email}
              </a>
            </li>
            <li>{SITE.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 px-4 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-xs text-primary-foreground/60 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-end">
            <Link href="/admin/login" className="hover:text-primary-foreground">
              Staff Login
            </Link>
            <span aria-hidden="true">·</span>
            <p>
              Site built and hosted by{" "}
              <a
                href="https://hiresignalworks.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-primary-foreground"
              >
                Signal Works
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
