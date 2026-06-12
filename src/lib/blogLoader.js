/**
 * @file blogLoader.js
 * @description Loads blog posts from src/content/blog/*.md at build time using Vite's import.meta.glob.
 *   Parses YAML frontmatter with gray-matter. Falls back to empty array on any error.
 */
import matter from "gray-matter";

const SAMPLE_ARTICLES = [
  {
    id: 1,
    title: "Top 10 Hidden Gems in Ghana You Must Visit",
    excerpt: "Discover lesser-known destinations that will take your breath away, from secret waterfalls to ancient villages.",
    category: "Travel Guide",
    readTime: "5 min read",
    date: "Jan 15, 2026",
    image: "https://images.unsplash.com/photo-1516069677018-3161f875605e?w=800&h=600&fit=crop",
    slug: "hidden-gems-ghana"
  },
  {
    id: 2,
    title: "The Ultimate Guide to Cape Coast Castle",
    excerpt: "Learn about the rich history and cultural significance of one of Ghana's most important heritage sites.",
    category: "Heritage",
    readTime: "8 min read",
    date: "Jan 12, 2026",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop",
    slug: "cape-coast-castle-guide"
  },
  {
    id: 3,
    title: "Best Street Food Spots in Accra",
    excerpt: "From jollof rice to kelewele, explore the vibrant street food scene in Ghana's capital city.",
    category: "Food & Culture",
    readTime: "4 min read",
    date: "Jan 10, 2026",
    image: "https://images.unsplash.com/photo-1504672281656-e4981d70414b?w=800&h=600&fit=crop",
    slug: "accra-street-food"
  },
  {
    id: 4,
    title: "Planning Your First Safari: What to Expect",
    excerpt: "Everything you need to know before embarking on your African safari adventure, from packing to wildlife spotting.",
    category: "Travel Tips",
    readTime: "6 min read",
    date: "Jan 8, 2026",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&h=600&fit=crop",
    slug: "first-safari-guide"
  },
  {
    id: 5,
    title: "Kakum National Park: Walking Above the Rainforest",
    excerpt: "Experience the thrill of the canopy walkway and discover the biodiversity of Ghana's tropical rainforest.",
    category: "Nature",
    readTime: "5 min read",
    date: "Jan 5, 2026",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop",
    slug: "kakum-national-park"
  }
];

function formatDate(value) {
  if (!value) return "";
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch {
    return String(value);
  }
}

function loadPosts() {
  try {
    const blogModules = import.meta.glob("../content/blog/*.md", {
      query: "?raw",
      import: "default",
      eager: true,
    });

    return Object.values(blogModules)
      .map((raw) => {
        if (!raw || typeof raw !== "string") return null;
        try {
          const { data, content } = matter(raw);
          return {
            slug: data.slug || "",
            title: data.title || "",
            excerpt: data.excerpt || "",
            category: data.category || "",
            readTime: data.readTime || "",
            date: formatDate(data.date),
            image: data.image || "",
            body: content || "",
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        return Number.isNaN(bDate.getTime()) ? -1 : Number.isNaN(aDate.getTime()) ? 1 : bDate - aDate;
      });
  } catch {
    return SAMPLE_ARTICLES.map((a) => ({ ...a, body: "" }));
  }
}

const allPosts = loadPosts();

export function getAllPosts() {
  return allPosts.map(({ body, ...meta }) => meta);
}

export function getPostBySlug(slug) {
  return allPosts.find((post) => post.slug === slug) || null;
}

export function getLatestPosts(n = 5) {
  return allPosts.slice(0, n).map(({ body, ...meta }) => meta);
}
