import { Link } from "react-router-dom";
import { HeartPulse, Users, Clock, ShieldCheck, ArrowRight, Star, PhoneCall, CalendarCheck, HandHeart, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBlogPosts } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const services = [
  {
    icon: HeartPulse,
    title: "Home Care",
    text: "Personal care, medication and daily living support in the comfort of your own home.",
  },
  {
    icon: Stethoscope,
    title: "Medical & Nursing Care",
    text: "Skilled nursing interventions, medication management and chronic condition support.",
  },
  {
    icon: HandHeart,
    title: "Dementia & Palliative Care",
    text: "Compassionate, person-centred support for people living with dementia and life-limiting illness.",
  },
  {
    icon: Clock,
    title: "Respite & Live-in Care",
    text: "Dedicated live-in or overnight cover to give families and carers a well-earned break.",
  },
];

const testimonials = [
  {
    quote: "The carers from Manasseh are like family. Mum looks forward to her visits every day.",
    name: "Anne H.",
    role: "Daughter of a client",
  },
  {
    quote: "Reliable, kind and professional. They took the time to really understand Dad's needs.",
    name: "Michael R.",
    role: "Son of a client",
  },
  {
    quote: "A wonderful team to work with. Genuinely caring people who go the extra mile.",
    name: "Sarah J.",
    role: "Caregiver",
  },
];

export default function Home() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const published = posts.filter((p) => p.status === "published").slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-subtle">
        <div className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_80%_-10%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="container relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-in-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Registered with the Care Inspectorate Wales
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Home care delivered with{" "}
              <span className="text-primary">tender love &amp; care</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Manasseh Health Care provides compassionate, professional care across
              Swansea and South Wales — helping you and your loved ones live safely and
              independently at home.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/book-appointment">
                  <CalendarCheck className="h-4 w-4" />
                  Book an appointment
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/services">Explore our services</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <span className="text-muted-foreground">Person-centred care you can trust</span>
            </div>
          </div>
          <div className="relative animate-fade-in-up lg:justify-self-end" style={{ animationDelay: "120ms" }}>
            <Card className="overflow-hidden shadow-lift">
              <div className="gradient-brand p-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">We're here to help</p>
                <h2 className="mt-2 font-display text-2xl font-semibold">Need care support?</h2>
                <p className="mt-2 text-sm text-white/90">
                  Tell us a little about your needs and we'll arrange a free, no-obligation assessment.
                </p>
                <div className="mt-6 grid gap-3">
                  <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" asChild>
                    <Link to="/book-appointment">Request a call back</Link>
                  </Button>
                  <Button size="lg" variant="ghost" className="border border-white/30 text-white hover:bg-white/10" asChild>
                    <a href="tel:+447801480923">
                      <PhoneCall className="h-4 w-4" /> +44 7801 480923
                    </a>
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-semibold">Our promise</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" /> DBS-checked, fully trained carers
                  </li>
                  <li className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-primary" /> Personalised care plans
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> 24/7 on-call support
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container py-16 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">What we do</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            Care that adapts to you
          </h2>
          <p className="mt-3 text-muted-foreground">
            From a helping hand with daily tasks to specialist dementia care, we tailor
            every service around the person.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <Card key={s.title} className="group p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Button variant="ghost" asChild>
            <Link to="/services">
              See all services <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Why us / stats */}
      <section className="gradient-brand text-white">
        <div className="container grid gap-10 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Why families choose Manasseh
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-white/85">
              We're a Swansea-based provider built on trust and led by a medical
              practitioner. Every client is matched with a consistent, familiar team who
              know their routines, preferences and history — so care feels personal, not
              transactional.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/90">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Fully regulated and CIW-registered</li>
              <li className="flex items-center gap-2"><Users className="h-4 w-4" /> Consistent, matched care teams</li>
              <li className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Person-centred care planning</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "2024", label: "Founded in Swansea" },
              { value: "10+", label: "Care services" },
              { value: "24/7", label: "On-call support" },
              { value: "CIW", label: "Registered provider" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                <p className="font-display text-4xl font-semibold">{s.value}</p>
                <p className="mt-1 text-sm text-white/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-16 lg:py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">Kind words from our families</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="p-6 shadow-soft">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Blog teaser */}
      {!isLoading && published.length > 0 && (
        <section className="container pb-16 lg:pb-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">News & insights</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">From our blog</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/blog">All articles <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {published.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`}>
                <Card className="group h-full overflow-hidden shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                  <div className="gradient-brand flex h-36 items-center justify-center">
                    <HeartPulse className="h-10 w-10 text-white/80" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground">
                      {p.published_at ? formatDate(p.published_at) : ""}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-semibold leading-snug group-hover:text-primary">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container pb-16 lg:pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-sidebar p-10 text-center text-sidebar-foreground sm:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_0%,hsl(var(--sidebar-primary)/0.25),transparent)]" />
          <div className="relative">
            <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Ready to start your care journey?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sidebar-foreground/80">
              Talk to our friendly team today. We'll listen, answer your questions and
              arrange a free care assessment.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/book-appointment">Book an appointment</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-sidebar-accent bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80" asChild>
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
