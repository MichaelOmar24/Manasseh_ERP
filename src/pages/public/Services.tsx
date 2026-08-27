import { Link } from "react-router-dom";
import {
  HeartPulse,
  HandHeart,
  Users,
  Clock,
  Baby,
  Pill,
  Sparkles,
  ArrowRight,
  CalendarCheck,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const catalog = [
  {
    icon: HeartPulse,
    title: "Personal & Domiciliary Care",
    text: "Assistance with washing, dressing, medication prompts and daily living — always on your terms, in your own home.",
  },
  {
    icon: Pill,
    title: "Medication Support",
    text: "Prompting and administering medication with careful recording, so you never miss a dose.",
  },
  {
    icon: HandHeart,
    title: "Live-in Care",
    text: "A dedicated carer living in your home, providing round-the-clock companionship and support.",
  },
  {
    icon: Users,
    title: "Dementia & Memory Support",
    text: "Specialist, patient carers trained to support people living with dementia with dignity.",
  },
  {
    icon: Clock,
    title: "Respite & Overnight Care",
    text: "Regular or occasional cover to give family carers a well-earned break, day or night.",
  },
  {
    icon: Baby,
    title: "Palliative & End-of-life",
    text: "Compassionate, dignified support for individuals and their families during difficult times.",
  },
  {
    icon: Sparkles,
    title: "Companionship",
    text: "Friendly visits for a chat, a walk or a shared activity — helping to combat loneliness.",
  },
  {
    icon: Stethoscope,
    title: "Post-Discharge & Rehab",
    text: "Structured support to help you regain independence after a hospital stay or surgery.",
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
