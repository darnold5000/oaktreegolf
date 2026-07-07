"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn, Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <Link href="/" className="flex min-w-0 flex-col">
          <span className="font-heading text-lg font-semibold tracking-tight text-primary sm:text-xl">
            {SITE.name}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:block">Plainfield, Indiana</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
            <Link href="/admin/login">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/book">Book Tee Time</Link>
          </Button>
          <a
            href={SITE.phoneHref}
            className="hidden items-center gap-1 text-sm font-medium text-primary md:flex"
          >
            <Phone className="h-4 w-4" />
            {SITE.phone}
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className={cn("border-t lg:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild className="mt-2">
            <Link href="/book">Book Tee Time</Link>
          </Button>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/admin/login" onClick={() => setOpen(false)}>
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
