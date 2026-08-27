import { Link } from "react-router-dom";
import {
  Sparkles,
  Brush,
  Home,
  CalendarCheck,
  Repeat,
  Zap,
  KeyRound,
  Plane,
  PhoneCall,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const regularCleans = [
  { label: "Weekly clean", price: "from £45", hint: "Your home, refreshed every week." },
  { label: "Fortnightly clean", price: "from £45", hint: "Regular care for your space." },
  { label: "Monthly clean", price: "from £55", hint: "A deep refresh, month by month." },
];

const deepCleans = [
  { label: "4 hour deep clean", price: "£140" },
  { label: "6 hour deep clean", price: "£210" },
  { label: "8 hour deep clean", price: "£280" },
];

const oneOffCleans = [
  { icon: KeyRound, label: "End of tenancy cleans", text: "Leave your home spotless and get your deposit back with confidence." },
  { icon: Home, label: "Pre moving-in cleans", text: "Move into a fresh, clean home from day one." },
  { icon: Sparkles, label: "One-off cleans", text: "A thorough one-time clean whenever you need it." },
  { icon: Plane, label: "Airbnb / holiday let cleans", text: "Quick turnaround cleans to keep your lets guest-ready." },
];

export default function CleaningServices() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-brand text-white">
        <div className="container py-16 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> New service
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
            Cleaning Services
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/90">
            Are you a compassionate individual looking to make a difference in the lives of
            others? We offer rewarding cleaning jobs with opportunities for growth and
            professional development.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/book-cleaning">
                <CalendarCheck className="h-4 w-4" /> Book a clean
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="border border-white/40 text-white hover:bg-white/10" asChild>
              <a href="tel:+447801480923">
                <PhoneCall className="h-4 w-4" /> +44 7801 480923
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Brand flyer header */}
      <section className="container pt-14">
        <Card className="gradient-subtle border-primary/15 p-8 text-center shadow-soft">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Brush className="h-6 w-6" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Price list for cleaning services
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Manasseh Clean
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Tender Love &amp; Care · Domestic Cleaning Specialist
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Professional, reliable and caring domestic cleaning across Swansea and South
            Wales. Every clean is carried out with the same tenderness we bring to our
            care services.
          </p>
        </Card>
      </section>

      {/* Price list */}
      <section className="container py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Regular cleans */}
          <Card className="overflow-hidden shadow-soft">
            <div className="bg-primary/10 px-6 py-4">
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-primary">
                <Repeat className="h-5 w-5" /> Regular Cleans
              </h3>
            </div>
            <div className="divide-y">
              {regularCleans.map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-3 px-6 py-4">
                  <div>
                    <p className="font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.hint}</p>
                  </div>
                  <span className="font-display text-lg font-semibold text-primary">{c.price}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Deep cleans */}
          <Card className="overflow-hidden shadow-soft">
            <div className="bg-warning/15 px-6 py-4">
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-warning-foreground">
                <Zap className="h-5 w-5" /> Deep Cleans
              </h3>
            </div>
            <div className="divide-y">
              {deepCleans.map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-3 px-6 py-4">
                  <p className="capitalize font-medium">{c.label}</p>
                  <span className="font-display text-lg font-semibold text-primary">{c.price}</span>
                </div>
              ))}
              <div className="px-6 py-4 text-sm">
                <p className="font-medium">Full house session</p>
                <p className="mt-1 flex items-center justify-between text-muted-foreground">
                  <span>Flexible whole-house deep clean</span>
                  <span className="font-semibold text-foreground">£35 per hour</span>
                </p>
                <p className="mt-3 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  A deposit is required to secure your deep clean
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* One-off / special cleans */}
        <h3 className="mt-12 mb-6 font-display text-2xl font-semibold tracking-tight">
          One-off &amp; specialist cleans
        </h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {oneOffCleans.map((c) => (
            <Card key={c.label} className="p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-display text-lg font-semibold">{c.label}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-16 lg:pb-20">
        <Card className="bg-sidebar overflow-hidden text-sidebar-foreground">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <h2 className="flex items-center gap-2 font-display text-3xl font-semibold tracking-tight">
                <ShieldCheck className="h-7 w-7 text-sidebar-primary" /> Book your clean today
              </h2>
              <p className="mt-3 leading-relaxed text-sidebar-foreground/80">
                Tell us what you need and we'll arrange a free, no-obligation quote. Regular,
                deep and one-off cleans — all carried out with care.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-sidebar-foreground/85">
                <p className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-sidebar-primary" /> <a href="tel:+447801480923" className="hover:text-white">+44 7801 480923</a></p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-sidebar-primary" /> <a href="mailto:info@manassehhealthcare.org" className="hover:text-white">info@manassehhealthcare.org</a></p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button size="lg" asChild>
                <Link to="/book-cleaning">Book a clean</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-sidebar-accent bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80" asChild>
                <Link to="/book-cleaning">Request a call back</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
