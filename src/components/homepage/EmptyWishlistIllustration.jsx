import { motion } from 'framer-motion';

/* ──────────────────────────────────────────────
   EmptyWishlistIllustration
   A hand-sketch-style basket with crossed handles,
   wire slats, grey interior shading, and floating
   hearts.  All paths are monochrome so the parent
   can control color via `text-slate-900` or similar.
   ────────────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 14,
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const basketVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

const handleLeftVariants = {
  hidden: { opacity: 0, x: -30, rotate: -12 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { type: 'spring', stiffness: 90, damping: 10, delay: 0.25 },
  },
};

const handleRightVariants = {
  hidden: { opacity: 0, x: 30, rotate: 12 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { type: 'spring', stiffness: 90, damping: 10, delay: 0.35 },
  },
};

const heartVariants = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.4 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 140,
      damping: 10,
      delay,
    },
  },
});

export function EmptyWishlistIllustration({ className = '' }) {
  return (
    <motion.svg
      viewBox="0 0 360 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Basket body (outline + slats + feet) ── */}
      <motion.g
        variants={basketVariants}
        animate={{
          y: [-3.5, 3.5, -3.5],
        }}
        transition={{
          duration: 4.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Outer body */}
        <path
          d="M72 95 L84 178 Q86 188 96 188 L264 188 Q274 188 276 178 L288 95"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Top rim — top line */}
        <path
          d="M68 88 L292 88"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* Top rim — bottom line (suggests thickness) */}
        <path
          d="M70 95 L290 95"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Vertical corner arcs rim */}
        <path
          d="M68 88 Q65 88 65 91 L70 95"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M292 88 Q295 88 295 91 L290 95"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Slats */}
        <rect x="118" y="102" width="14" height="72" rx="4" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <rect x="150" y="102" width="14" height="72" rx="4" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <rect x="182" y="102" width="14" height="72" rx="4" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <rect x="214" y="102" width="14" height="72" rx="4" stroke="currentColor" strokeWidth="1.6" fill="none" />

        {/* Grey shading inside a couple of slats */}
        <rect x="122" y="142" width="6" height="28" rx="3" fill="currentColor" opacity="0.22" />
        <rect x="186" y="152" width="6" height="18" rx="3" fill="currentColor" opacity="0.18" />
        <rect x="218" y="146" width="6" height="24" rx="3" fill="currentColor" opacity="0.15" />

        {/* Feet */}
        <path d="M124 188 L124 194 Q124 196 126 196 L142 196 Q144 196 144 194 L144 188" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M216 188 L216 194 Q216 196 218 196 L234 196 Q236 196 236 194 L236 188" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.g>

      {/* ── Crossed handles (thick diagonal bars) ── */}
      <motion.path
        d="M82 42 L278 78"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        variants={handleLeftVariants}
        animate={{
          rotate: [-1.2, 1.2, -1.2],
        }}
        transition={{
          duration: 3.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '180px 60px' }}
      />
      <motion.path
        d="M278 42 L82 78"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        variants={handleRightVariants}
        animate={{
          rotate: [1.2, -1.2, 1.2],
        }}
        transition={{
          duration: 3.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '180px 60px' }}
      />

      {/* ── Hearts ── */}

      {/* Top-left small heart */}
      <motion.g
        variants={heartVariants(0.5)}
        animate={{
          y: [-8, 8, -8],
          x: [-3, 4, -3],
          rotate: [-10, 10, -10],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '38px 52px' }}
      >
        <path d="M48 44 C48 37 39 34 36 40 C33 34 24 37 24 44 C24 54 36 62 36 62 C36 62 48 54 48 44Z" fill="currentColor" />
      </motion.g>

      {/* Top-right large heart */}
      <motion.g
        variants={heartVariants(0.7)}
        animate={{
          y: [-11, 11, -11],
          x: [4, -4, 4],
          rotate: [-12, 12, -12],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '314px 48px' }}
      >
        <path d="M330 36 C330 25 317 21 312 31 C307 21 294 25 294 36 C294 52 312 63 312 63 C312 63 330 52 330 36Z" fill="currentColor" />
      </motion.g>

      {/* Mid-right small heart */}
      <motion.g
        variants={heartVariants(0.9)}
        animate={{
          y: [-9, 9, -9],
          x: [-4, 3, -4],
          rotate: [-8, 8, -8],
          scale: [1, 1.14, 1],
        }}
        transition={{
          duration: 3.0,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '300px 108px' }}
      >
        <path d="M308 102 C308 97 302 95 300 99 C298 95 292 97 292 102 C292 109 300 114 300 114 C300 114 308 109 308 102Z" fill="currentColor" />
      </motion.g>

      {/* Bottom-right tiny heart */}
      <motion.g
        variants={heartVariants(1.1)}
        animate={{
          y: [-7, 7, -7],
          x: [3, -3, 3],
          rotate: [-14, 14, -14],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '276px 158px' }}
      >
        <path d="M282 156 C282 154 278 153 276 155 C274 153 270 154 270 156 C270 160 276 163 276 163 C276 163 282 160 282 156Z" fill="currentColor" />
      </motion.g>
    </motion.svg>
  );
}
