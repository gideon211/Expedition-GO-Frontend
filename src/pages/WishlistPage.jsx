/**
 * @file WishlistPage.jsx
 * @description Saved tours page (/wishlist). Reads from WishlistContext (localStorage).
 *
 * @see contexts/WishlistContext.jsx
 */
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Footer } from '@/components/homepage/Footer';
import { FeaturedExperiencesCard } from '@/components/homepage/FeaturedExperiencesCard';
import { EmptyWishlistIllustration } from '@/components/homepage/EmptyWishlistIllustration';
import { useWishlist } from '@/contexts/WishlistContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { RecentlyViewedProvider } from '@/contexts/RecentlyViewedContext';
import { Navbar } from '@/components/homepage/Navbar';

const textContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.35,
    },
  },
};

const textItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 110, damping: 14 },
  },
};

function WishlistPageContent() {
  const { t } = useTranslation();
  const { wishlist } = useWishlist();

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--page-bg)] text-slate-900">
      <Navbar forceShowCompactSearch />

      <main className="mx-auto flex-1 w-full max-w-[1360px] px-5 py-5 sm:px-5 sm:py-7 lg:px-6 lg:py-8 relative">
        {/* Tour count badge — top right */}
        {wishlist.length > 0 && (
          <span className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-5 lg:right-5 rounded-full bg-[color:var(--brand-mist)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-green)] sm:text-sm">
            {wishlist.length}{' '}
            {wishlist.length === 1 ? t('wishlist.tourSaved') : t('wishlist.toursSaved')}
          </span>
        )}

        {/* Header */}
        <div className="mb-5 flex items-center justify-center gap-3 sm:mb-7">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="min-w-0 text-center">
              <h1
                className="leading-tight text-slate-900"
                style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}
              >
                {t('wishlist.title')}
              </h1>
              <p
                className="mt-1 text-slate-600 hidden sm:block"
                style={{ fontSize: 'clamp(0.875rem, 0.8vw + 0.5rem, 1rem)' }}
              >
                {wishlist.length}{' '}
                {wishlist.length === 1 ? t('wishlist.toursSaved') : t('wishlist.toursSaved')}
              </p>
            </div>
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[color:var(--brand-mist)] text-[color:var(--brand-green)] sm:size-12">
              <Heart className="size-5 fill-current sm:size-6" />
            </div>
          </div>
        </div>

        {/* Wishlist Content */}
        {wishlist.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16 text-center sm:py-24"
            variants={textContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Illustration — currentColor renders as slate-900 via parent text color */}
            <div className="mb-6 flex w-full justify-center">
              <div className="mb-5 w-full max-w-[280px] text-slate-900 sm:mb-7 sm:max-w-[320px]">
                <EmptyWishlistIllustration className="w-full" />
              </div>
            </div>

            <motion.h2
              className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl"
              variants={textItem}
            >
              {t('wishlist.empty')}
            </motion.h2>

            <motion.p
              className="mb-8 max-w-xs text-base leading-relaxed text-slate-500"
              variants={textItem}
            >
              {t('wishlist.emptyDesc')}
            </motion.p>

            <motion.div variants={textItem}>
              <Link
                to="/"
                state={{ postAuthSplash: true }}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand-green)] px-8 py-3 text-base font-semibold !text-white shadow-lg shadow-[color:var(--brand-green)]/25 transition hover:bg-[color:var(--brand-green)]/90 hover:shadow-xl hover:shadow-[color:var(--brand-green)]/30 hover:scale-[1.03] active:scale-[0.98] sm:text-sm"
              >
                {t('wishlist.exploreTours')}
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((item, index) => (
              <FeaturedExperiencesCard key={`${item.title}-${index}`} {...item} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function WishlistPage() {
  return (
    <AuthModalProvider>
      <RecentlyViewedProvider>
        <WishlistPageContent />
      </RecentlyViewedProvider>
    </AuthModalProvider>
  );
}

export default WishlistPage;
