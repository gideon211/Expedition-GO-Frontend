/**
 * @file ArticleDetailPage.jsx
 * @description Individual blog article page (/blog/:slug). Renders markdown body via react-markdown.
 */
import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Navbar } from "@/components/homepage/Navbar";
import { Footer } from "@/components/homepage/Footer";
import { getPostBySlug } from "@/lib/blogLoader";

export function ArticleDetailPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[color:var(--page-bg)]">
        <Navbar />
        <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />
        <main className="mx-auto max-w-[1520px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[color:var(--brand-green)]"
          >
            <ArrowLeft className="size-4" />
            Back to Blog
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Article not found</h1>
          <p className="mt-2 text-slate-500">The article you're looking for doesn't exist.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--page-bg)]">
      <Navbar />
      <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Link
          to="/blog"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[color:var(--brand-green)]"
        >
          <ArrowLeft className="size-4" />
          Back to Blog
        </Link>

        <p className="mb-3 text-sm text-[color:var(--brand-green)] font-semibold uppercase tracking-wide">
          {post.category}
        </p>

        <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>

        <div className="mb-6 flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-4" />
            <span>{post.readTime}</span>
          </div>
        </div>

        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="mb-8 w-full rounded-xl object-cover aspect-[16/10]"
          />
        )}

        <article className="prose prose-slate max-w-none prose-headings:text-[color:var(--brand-green)] prose-a:text-[color:var(--brand-green)] prose-img:rounded-xl">
          <ReactMarkdown>{post.body}</ReactMarkdown>
        </article>
      </main>

      <Footer />
    </div>
  );
}
