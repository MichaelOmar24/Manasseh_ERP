import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBlogPosts } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { NotFound } from "@/pages/NotFound";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: posts = [], isLoading } = useBlogPosts();
  const post = posts.find((p) => p.slug === slug && p.status === "published");

  if (isLoading) {
    return <div className="container py-16 text-muted-foreground">Loading article…</div>;
  }

  if (!post) {
    return <NotFound />;
  }

  return (
    <div>
      <section className="gradient-subtle">
        <div className="container py-14">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-3 text-muted-foreground">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4" /> Back to blog
            </Link>
          </Button>
          <p className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> {post.published_at ? formatDate(post.published_at) : ""}
            </span>
            {post.profiles?.full_name ? (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" /> {post.profiles.full_name}
              </span>
            ) : null}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight lg:text-5xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{post.excerpt}</p>
          ) : null}
        </div>
      </section>

      <section className="container py-14">
        <Card className="mx-auto max-w-3xl p-8 shadow-soft lg:p-10">
          <div className="prose prose-slate max-w-none">
            {(post.content ?? "").split("\n\n").map((para, i) => (
              <p key={i} className="mb-4 leading-relaxed text-muted-foreground">
                {para}
              </p>
            ))}
          </div>
        </Card>
        <div className="mx-auto mt-10 max-w-3xl">
          <Button asChild>
            <Link to="/book-appointment">Book an appointment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
