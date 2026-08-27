import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, Phone, Mail, MapPin, HeartPulse, Facebook, Instagram, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Book our staff", href: "/book-staff" },
  { label: "About us", href: "/about" },
  { label: "CIW Annual return", href: "/ciw-annual-return" },
  { label: "Join Us", href: "/careers" },
  { label: "Contact Us", href: "/contact" },
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur">
        <div className="container flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center">
            <img
              src="/assets/manasseh-logo.png"
              alt="Manasseh Health Care - Tender Love and Care"
              className="h-12 w-auto max-w-[220px] sm:h-14 sm:max-w-[260px]"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) =>
              l.href === "/services" ? (
                <DropdownMenu key={l.href}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {l.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-60">
                    <DropdownMenuLabel>Our services</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to="/services">All services</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/services/cleaning" className="gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Cleaning services
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <NavLink
                  key={l.href}
                  to={l.href}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground",
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild className="hidden sm:inline-flex">
              <Link to="/book-appointment">Book an appointment</Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex flex-col gap-1 p-4">
                  <img
                    src="/assets/manasseh-logo.png"
                    alt="Manasseh Health Care"
                    className="mb-4 h-12 w-auto"
                  />
                  {[...navLinks, { label: "Book an appointment", href: "/book-appointment" }].map((l) => (
                    <NavLink
                      key={l.href}
                      to={l.href}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          isActive && "bg-accent text-accent-foreground",
                        )
                      }
                    >
                      {l.label}
                    </NavLink>
                  ))}
                  <NavLink
                    to="/services/cleaning"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-primary hover:bg-accent"
                  >
                    <Sparkles className="h-4 w-4" />
                    Cleaning services
                  </NavLink>
                  <Button asChild className="mt-2">
                    <Link to="/login">Staff &amp; Client Login</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-sidebar text-sidebar-foreground">
        <div className="container grid gap-10 py-14 md:grid-cols-4">
          <div className="md:col-span-1">
            <img
              src="/assets/manasseh-logo-white.png"
              alt="Manasseh Health Care"
              className="h-14 w-auto"
            />
            <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/80">
              Compassionate home care across South Wales, delivered with tender love and care.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="icon" className="border-sidebar-accent bg-sidebar-accent hover:bg-sidebar-accent/80" asChild>
                <a href="#" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
              </Button>
              <Button variant="outline" size="icon" className="border-sidebar-accent bg-sidebar-accent hover:bg-sidebar-accent/80" asChild>
                <a href="#" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm text-sidebar-foreground/80">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="transition-colors hover:text-sidebar-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Our Services</h4>
            <ul className="mt-4 space-y-2 text-sm text-sidebar-foreground/80">
              {["Home Care", "Live-in Care", "Dementia & Palliative Care", "Respite Care", "Medication Support"].map((s) => (
                <li key={s}>
                  <Link to="/services" className="transition-colors hover:text-sidebar-foreground">
                    {s}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/services/cleaning" className="flex items-center gap-1.5 transition-colors hover:text-sidebar-foreground">
                  <Sparkles className="h-3.5 w-3.5" /> Cleaning Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-sidebar-foreground/80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                9 Kilvey Terrace, St Thomas,<br />Swansea SA1 8BA
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+447801480923" className="hover:text-sidebar-foreground">+44 7801 480923</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:info@manassehhealthcare.org" className="hover:text-sidebar-foreground">info@manassehhealthcare.org</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sidebar-accent">
          <div className="container flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-sidebar-foreground/70 sm:flex-row sm:text-left">
            <p className="flex items-center gap-1.5">
              <HeartPulse className="h-3.5 w-3.5" />
              Registered with the Care Inspectorate Wales (CIW) - Tender Love &amp; Care since 2024.
            </p>
            <p>© {new Date().getFullYear()} Manasseh Health Care. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
