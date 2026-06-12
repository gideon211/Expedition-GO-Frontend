/**
 * @file BlogPage.jsx
 * @description Blog listing page (/blog). Displays all articles in a responsive grid.
 */
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/homepage/Navbar";
import { Footer } from "@/components/homepage/Footer";
import { ArticleCard } from "@/components/homepage/ArticleCard";
import { getAllPosts } from "@/lib/blogLoader";

export function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-[color:var(--page-bg)]">
      <Navbar />
      <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />

      <main className="mx-auto max-w-[1520px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[color:var(--brand-green)]"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>

        <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Travel Blog
        </h1>
        <p className="mb-8 text-sm text-slate-500 sm:text-base">
          Tips, guides, and stories from across Ghana and beyond.
        </p>

        {posts.length === 0 ? (
          <p className="py-12 text-center text-slate-500">No articles yet. Check back soon!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ArticleCard key={post.slug} article={post} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
