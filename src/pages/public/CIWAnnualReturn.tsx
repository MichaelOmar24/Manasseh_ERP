import { Link } from "react-router-dom";
import { FileText, ShieldCheck, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDocuments } from "@/lib/api";

export default function CIWAnnualReturn() {
  const { data: docs = [], isLoading } = useDocuments();
  const returns = docs.filter((d) => d.category === "ciw_annual_return");

  return (
    <div>
      <section className="gradient-subtle">
        <div className="container py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Transparency</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            CIW Annual Return
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            As a provider registered with the Care Inspectorate Wales, we publish our
            annual return and key regulatory documents here for families, commissioners
            and the public.
          </p>
        </div>
      </section>

      <section className="container grid gap-8 py-14 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Published documents</h2>
          {isLoading ? (
            <p className="mt-4 text-muted-foreground">Loading documents…</p>
          ) : returns.length === 0 ? (
            <Card className="mt-4 p-6 text-sm text-muted-foreground">
              No documents published yet. Please check back soon.
            </Card>
          ) : (
            <div className="mt-4 space-y-3">
              {returns.map((d) => (
                <Card key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-5 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.file_name ?? "PDF document"}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={d.file_url ?? "#"} target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4" /> View document
                    </a>
                  </Button>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <Card className="p-6 shadow-soft">
              <h3 className="font-display text-lg font-semibold">Our registration</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Manasseh Health Care Ltd is registered with the Care Inspectorate Wales for
                the provision of domiciliary care services. Our registration is subject to
                regular inspection, and we are proud to maintain consistently good outcomes
                for the people we support.
              </p>
            </Card>
            <Card className="p-6 shadow-soft">
              <h3 className="font-display text-lg font-semibold">Standards we work to</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> The Regulation and Inspection of Social Care (Wales) Act 2016</li>
                <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> CIW National Minimum Standards for Domiciliary Care</li>
                <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> The Social Services and Well-being (Wales) Act 2014</li>
              </ul>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Concerns about a provider?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If you have a concern about care in Wales, the Care Inspectorate Wales
              investigates all complaints.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="https://www.careinspectorate.wales" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" /> Visit CIW website
              </a>
            </Button>
          </Card>
          <Card className="p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Questions?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our compliance team is happy to answer questions about our regulatory status.
            </p>
            <Button asChild className="mt-4">
              <Link to="/contact">Contact us</Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
