import { Link } from "react-router-dom";
import { HeartHandshake, ShieldCheck, Users, HandHeart, Target, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const values = [
  {
    icon: HeartHandshake,
    title: "Compassion",
    text: "We treat every client as we would our own family — with patience, warmth and respect.",
  },
  {
    icon: Target,
    title: "Reliability",
    text: "You can depend on us. Visits happen on time, communication is honest, promises are kept.",
  },
  {
    icon: Users,
    title: "Dignity",
    text: "Care that respects choice, independence and privacy at every stage.",
  },
  {
    icon: Leaf,
    title: "Excellence",
    text: "We invest in training and quality so the standard of care never slips.",
  },
];

const timeline = [
  { year: "2024", title: "Founded in Swansea", text: "Manasseh Healthcare Ltd is founded by Morenike Adesanya, a medical practitioner, with a clear vision of person-centred care." },
  { year: "2025", title: "Registered with CIW", text: "We register with the Care Inspectorate Wales to deliver regulated domiciliary support across Swansea and South Wales." },
  { year: "2025", title: "Growing our care team", text: "Registered managers, senior carers and care coordinators join us to deliver safe, caring and responsive support." },
  { year: "2026", title: "The Manasseh platform", text: "We launch our digital care management system to bring clients, families and carers closer together." },
];

export default function About() {
  return (
    <div>
      <section className="gradient-subtle">
        <div className="container py-16 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">About us</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold tracking-tight lg:text-5xl">
            Person-centred care, led by a medical practitioner
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Our name comes from the blessing of Manasseh — "God has made me forget all my
            troubles" — a reminder of the relief and comfort good care brings.
          </p>
        </div>
      </section>

      <section className="container grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">Our story</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Manasseh Healthcare Ltd was founded in 2024 by Morenike Adesanya, a medical
            practitioner who saw first-hand how the right support can transform someone's
            quality of life — and how impersonal, rushed care lets people down.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Registered as a limited company with the Care Inspectorate Wales, our growing
            team of registered managers, nurses, senior carers and care coordinators
            serves the people of Swansea and across South Wales. Every decision is still
            guided by the same question: "Would we want this for our own loved one?"
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link to="/contact">Meet our team</Link></Button>
            <Button variant="outline" asChild><Link to="/careers">Join us</Link></Button>
          </div>
        </div>
        <Card className="p-8 shadow-lift">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-semibold">Our regulatory commitment</h3>
          </div>
          <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Registered with the Care Inspectorate Wales (CIW) for domiciliary care services.
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Registered Manager: Morenike Adesanya Idama.
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Every carer is DBS-checked, reference-checked and completes mandatory training.
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Our CIW Annual Return is published for transparency — see the dedicated page.
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Fully insured, including employers' and public liability cover.
            </li>
          </ul>
          <Button variant="outline" asChild className="mt-6">
            <Link to="/ciw-annual-return">View our CIW annual return</Link>
          </Button>
        </Card>
      </section>

      <section className="gradient-subtle">
        <div className="container py-16">
          <div className="text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">Our values</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Four simple values guide everything we do, from the office to the doorstep.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <Card key={v.title} className="p-6 text-center shadow-soft">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="font-display text-3xl font-semibold tracking-tight">Our journey</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {timeline.map((t) => (
            <div key={t.year} className="relative rounded-2xl border bg-card p-6 shadow-soft">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {t.year}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
