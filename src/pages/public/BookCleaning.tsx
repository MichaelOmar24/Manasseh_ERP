import { useState } from "react";
import { toast } from "sonner";
import {
  Brush,
  Repeat,
  Zap,
  Sparkles,
  CalendarCheck,
  PhoneCall,
  Mail,
  Check,
  Home,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type CleanCategory = "regular" | "deep" | "specialist";

const categories: {
  id: CleanCategory;
  icon: typeof Repeat;
  title: string;
  desc: string;
  options: { value: string; price: string; hint?: string }[];
}[] = [
  {
    id: "regular",
    icon: Repeat,
    title: "Regular Cleans",
    desc: "Weekly, fortnightly or monthly",
    options: [
      { value: "Weekly clean", price: "from £45", hint: "Your home, refreshed every week." },
      { value: "Fortnightly clean", price: "from £45", hint: "Regular care for your space." },
      { value: "Monthly clean", price: "from £55", hint: "A deep refresh, month by month." },
    ],
  },
  {
    id: "deep",
    icon: Zap,
    title: "Deep Cleans",
    desc: "A thorough one-off deep clean",
    options: [
      { value: "4 hour deep clean", price: "£140" },
      { value: "6 hour deep clean", price: "£210" },
      { value: "8 hour deep clean", price: "£280" },
      { value: "Full house session", price: "£35 / hour" },
    ],
  },
  {
    id: "specialist",
    icon: Sparkles,
    title: "One-off & Specialist",
    desc: "Tenancy, moving-in, one-off & lets",
    options: [
      { value: "End of tenancy clean", price: "Quote" },
      { value: "Pre moving-in clean", price: "Quote" },
      { value: "One-off clean", price: "Quote" },
      { value: "Airbnb / holiday let clean", price: "Quote" },
    ],
  },
];

const timeSlots = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
];

export default function BookCleaning() {
  const [category, setCategory] = useState<CleanCategory>("regular");
  const [service, setService] = useState("Weekly clean");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    postcode: "",
    preferred_date: "",
    time_slot: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const active = categories.find((c) => c.id === category)!;

  const chooseCategory = (id: CleanCategory) => {
    setCategory(id);
    setService(categories.find((c) => c.id === id)!.options[0].value);
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address || !form.preferred_date || !form.time_slot) {
      toast.error("Please complete your name, email, property address, preferred date and time.");
      return;
    }
    setSubmitting(true);
    const price = active.options.find((o) => o.value === service)?.price ?? "";
    const { error } = await supabase.from("appointments").insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      appointment_type: "cleaning_booking",
      requested_date: form.preferred_date,
      time_slot: `${form.time_slot} · ${service} (${price})`,
      notes: [
        `Service: ${service}`,
        price ? `Price: ${price}` : "",
        `Property: ${form.address}${form.postcode ? `, ${form.postcode}` : ""}`,
        form.notes || "",
      ]
        .filter(Boolean)
        .join("\n"),
      preferred_contact_method: "phone",
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success("Cleaning booking request received! We'll confirm your appointment shortly.");
    setForm({ name: "", email: "", phone: "", address: "", postcode: "", preferred_date: "", time_slot: "", notes: "" });
    setService(active.options[0].value);
  };

  return (
    <div>
      {/* Hero */}
      <section className="gradient-brand text-white">
        <div className="container py-14 lg:py-16">
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-4 text-white/85 hover:bg-white/10 hover:text-white">
            <Link to="/services/cleaning">
              <ArrowLeft className="h-4 w-4" /> Back to cleaning services
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Brush className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Manasseh Clean</p>
              <h1 className="font-display text-4xl font-semibold tracking-tight">Book a Clean</h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-white/90">
            Choose the clean you need, pick a time that suits you, and our team will
            confirm your booking. Domestic Cleaning Specialist — Tender Love &amp; Care.
          </p>
        </div>
      </section>

      <section className="container py-12 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: booking steps */}
          <div className="space-y-8 lg:col-span-2">
            {/* Step 1: category */}
            <div>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">1</span>
                Choose the type of clean
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => chooseCategory(c.id)}
                    className={cn(
                      "rounded-2xl border-2 p-5 text-left transition-all hover:shadow-lift",
                      category === c.id
                        ? "border-primary bg-primary/5 shadow-lift"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", category === c.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                      <c.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold">{c.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: option */}
            <div>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">2</span>
                Choose your {active.title.toLowerCase()}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {active.options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setService(o.value)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border-2 p-4 text-left transition-all",
                      service === o.value ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-medium capitalize">{o.value}</p>
                      {o.hint ? <p className="text-xs text-muted-foreground">{o.hint}</p> : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-display font-semibold text-primary">{o.price}</span>
                      {service === o.value ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: details */}
            <Card className="p-6 shadow-soft lg:p-8">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">3</span>
                Your details &amp; booking
              </h2>
              <form onSubmit={submit} className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cname">Full name *</Label>
                    <Input id="cname" value={form.name} onChange={set("name")} placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cemail">Email *</Label>
                    <Input id="cemail" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cphone">Phone</Label>
                    <Input id="cphone" value={form.phone} onChange={set("phone")} placeholder="Mobile or landline" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cdate">Preferred date *</Label>
                    <Input id="cdate" type="date" value={form.preferred_date} onChange={set("preferred_date")} min={new Date().toISOString().slice(0, 10)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cslot">Preferred time *</Label>
                    <Select value={form.time_slot} onValueChange={(v) => setForm((f) => ({ ...f, time_slot: v }))}>
                      <SelectTrigger id="cslot"><SelectValue placeholder="Select a time slot" /></SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caddress">Property address *</Label>
                  <Input id="caddress" value={form.address} onChange={set("address")} placeholder="Street address of the property to be cleaned" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpostcode">Postcode</Label>
                  <Input id="cpostcode" value={form.postcode} onChange={set("postcode")} placeholder="e.g. SA1 8BA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnotes">Anything we should know?</Label>
                  <Textarea id="cnotes" rows={3} value={form.notes} onChange={set("notes")} placeholder="Number of bedrooms, pets, parking, access notes, etc." />
                </div>
                <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
                  <CalendarCheck className="h-4 w-4" />
                  {submitting ? "Sending…" : `Book ${service.toLowerCase()}`}
                </Button>
              </form>
            </Card>
          </div>

          {/* Right: summary + contact */}
          <div className="space-y-4">
            <Card className="sticky top-24 p-6 shadow-soft">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Home className="h-5 w-5 text-primary" /> Your clean
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-medium capitalize">{active.title}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Service</dt>
                  <dd className="text-right font-medium capitalize">{service}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Price</dt>
                  <dd className="font-semibold text-primary">
                    {active.options.find((o) => o.value === service)?.price ?? "—"}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                Deep cleans require a deposit to secure your appointment. We'll confirm the
                exact quote when we contact you.
              </p>
            </Card>

            <Card className="p-6 shadow-soft">
              <h3 className="font-display text-lg font-semibold">Prefer to talk?</h3>
              <p className="mt-2 text-sm text-muted-foreground">We're happy to help you choose the right clean.</p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-primary" /> <a href="tel:+447801480923" className="hover:text-foreground">+44 7801 480923</a></p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href="mailto:info@manassehhealthcare.org" className="hover:text-foreground">info@manassehhealthcare.org</a></p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
