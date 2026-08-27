import { Link } from "react-router-dom";
import { HeartPulse, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBlogPosts } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function Blog() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const published = posts.filter((p) => p.status === "published");

  return (
    <div>
      <section className="gradient-subtle">
        <div className="container py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">News & insights</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">The Manasseh blog</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Care tips, company news and stories from our team across South Wales.
          </p>
        </div>
      </section>

      <section className="container py-14">
        {isLoading ? (
          <p className="text-muted-foreground">Loading articles…</p>
        ) : published.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No articles published yet.</Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {published.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`}>
                <Card className="group h-full overflow-hidden shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                  <div className="gradient-brand flex h-40 items-center justify-center">
                    <HeartPulse className="h-12 w-12 text-white/80" />
                  </div>
                  <div className="p-5">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {p.published_at ? formatDate(p.published_at) : ""}
                    </p>
                    <h2 className="mt-2 font-display text-xl font-semibold leading-snug group-hover:text-primary">
                      {p.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                    <p className="mt-3 text-sm font-medium text-primary">Read more →</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
