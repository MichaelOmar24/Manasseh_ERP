import { Link } from "react-router-dom";
import {
  HeartPulse,
  HandHeart,
  Users,
  Clock,
  Pill,
  Sparkles,
  ArrowRight,
  CalendarCheck,
  Stethoscope,
  Home,
  Activity,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const catalog = [
  {
    icon: Stethoscope,
    title: "Medical Care",
    text: "Primary care consultations, chronic disease management, medication management and wound care — at home.",
  },
  {
    icon: HeartPulse,
    title: "Nursing Care",
    text: "Skilled nursing assessments and interventions, IV therapy, catheter and diabetes care.",
  },
  {
    icon: Home,
    title: "Home Health Services",
    text: "Home visits by registered nurses and carers, medication support, personal hygiene and meal preparation.",
  },
  {
    icon: HandHeart,
    title: "Dementia & Palliative Care",
    text: "Compassionate memory support, pain and symptom management, and dignified end-of-life care.",
  },
  {
    icon: Activity,
    title: "Rehabilitation",
    text: "Physical, occupational and speech therapy to rebuild strength, mobility and independence.",
  },
  {
    icon: Users,
    title: "Disability Support",
    text: "Personal care, mobility assistance, adaptive equipment and community integration support.",
  },
  {
    icon: LifeBuoy,
    title: "Mental Health & Counselling",
    text: "Therapy sessions, crisis intervention and substance abuse counselling with dignity and respect.",
  },
  {
    icon: Clock,
    title: "Respite & Live-in Care",
    text: "Overnight, live-in and relief cover that gives families and unpaid carers a well-earned break.",
  },
  {
    icon: Pill,
    title: "Additional Support",
    text: "Caregiver education, transport to appointments, home modifications and support groups.",
  },
];

export default function Services() {
  return (
    <div>
      <section className="gradient-subtle">
        <div className="container py-16 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our services</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold tracking-tight lg:text-5xl">
            High-quality care, built around you
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Every service starts with a free assessment. We listen, plan together, and
            build care that supports independence, dignity and wellbeing.
          </p>
        </div>
      </section>

      <section className="container py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((s) => (
            <Card key={s.title} className="group p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container pb-16 lg:pb-20">
        <Card className="gradient-brand overflow-hidden text-white">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                Not sure what you need?
              </h2>
              <p className="mt-3 leading-relaxed text-white/85">
                Our care coordinators are happy to talk through your situation and
                recommend the right level of support. No obligation, no pressure.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link to="/book-appointment">
                  <CalendarCheck className="h-4 w-4" /> Book an appointment
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="border border-white/40 text-white hover:bg-white/10" asChild>
                <Link to="/book-staff">
                  Book our staff <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
