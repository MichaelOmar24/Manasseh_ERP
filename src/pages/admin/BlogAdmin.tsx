import { useState } from "react";
import { toast } from "sonner";
import { Plus, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBlogPosts, useTableMutation } from "@/lib/api";
import { useAuth } from "@/context/auth";
import type { BlogPost } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function BlogAdmin() {
  const { data: posts = [], isLoading } = useBlogPosts();

  const columns: Column<BlogPost>[] = [
    { header: "Title", cell: (p) => (
      <span className="flex items-center gap-2 font-medium"><Newspaper className="h-4 w-4 text-primary" /> {p.title}</span>
    ) },
    { header: "Slug", cell: (p) => <span className="font-mono text-xs text-muted-foreground">/blog/{p.slug}</span> },
    { header: "Published", cell: (p) => <span className="text-muted-foreground">{formatDate(p.published_at)}</span> },
    { header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
    { header: "", cell: (p) => <PublishAction post={p} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Blog & News"
        description="Publish articles to the public website."
        action={<NewPostDialog />}
      />
      <DataTable columns={columns} rows={posts} loading={isLoading} keyOf={(p) => p.id} emptyTitle="No posts yet" />
    </div>
  );
}

function PublishAction({ post }: { post: BlogPost }) {
  const { mutateAsync, isPending } = useTableMutation<BlogPost>("blog_posts");
  const publish = async () => {
    await mutateAsync({ id: post.id, values: { status: "published", published_at: new Date().toISOString() } });
    toast.success("Post published.");
  };
  const unpublish = async () => {
    await mutateAsync({ id: post.id, values: { status: "draft" } });
    toast.success("Post moved to draft.");
  };
  return post.status === "published" ? (
    <Button size="sm" variant="outline" onClick={unpublish} disabled={isPending}>Unpublish</Button>
  ) : (
    <Button size="sm" onClick={publish} disabled={isPending}>Publish</Button>
  );
}

function NewPostDialog() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", status: "published" });
  const { mutateAsync, isPending } = useTableMutation<BlogPost>("blog_posts");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return toast.error("Post title is required.");
    await mutateAsync({
      values: {
        title: form.title,
        slug: slugify(form.title),
        excerpt: form.excerpt || null,
        content: form.content || null,
        author_id: profile?.id,
        status: form.status,
        published_at: form.status === "published" ? new Date().toISOString() : null,
      },
    });
    toast.success(form.status === "published" ? "Post published." : "Draft saved.");
    setOpen(false);
    setForm({ title: "", excerpt: "", content: "", status: "published" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> New post</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Create blog post</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
          <div className="space-y-2"><Label>Content</Label><Textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : form.status === "published" ? "Publish" : "Save draft"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
