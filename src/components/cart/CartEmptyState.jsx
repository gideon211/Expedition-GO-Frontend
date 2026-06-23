/**
 * @file CartEmptyState.jsx
 * @description Animated empty-state illustration for the cart page.
 *   Uses cartIcon.png with a gentle floating bounce, fade-in stagger,
 *   and decorative sparkles.
 */
import { motion } from 'framer-motion';
import cartIcon from '@/assets/images/cartIcon.png';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 110, damping: 14 },
  },
};

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const pulseVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: {
    scale: [0.9, 1.05, 0.9],
    opacity: [0.4, 0.7, 0.4],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const sparkleVariants = {
  hidden: { opacity: 0, scale: 0, rotate: -45 },
  visible: (i) => ({
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    rotate: [-45, 0, 45],
    y: [0, -14, -28],
    x: [0, (i % 2 === 0 ? 1 : -1) * 10, (i % 2 === 0 ? 1 : -1) * 18],
    transition: {
      duration: 2.4,
      delay: 1.2 + i * 0.35,
      repeat: Infinity,
      repeatDelay: 1.2,
      ease: 'easeInOut',
    },
  }),
};

export function CartEmptyState({ className = '' }) {
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-hidden="true"
    >
      {/* Soft background pulse rings */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[color:var(--brand-green)]/5"
        variants={pulseVariants}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className="absolute inset-4 rounded-full bg-[color:var(--brand-green)]/5"
        variants={pulseVariants}
        initial="initial"
        animate="animate"
        style={{ animationDelay: '0.6s' }}
      />

      {/* Floating cart icon */}
      <motion.div className="relative z-10" variants={itemVariants}>
        <div className="grid size-40 place-items-center sm:size-48">
          <motion.img
            src={cartIcon}
            alt=""
            width="160"
            height="160"
            className="h-32 w-32 object-contain sm:h-40 sm:w-40"
            variants={floatVariants}
            initial="initial"
            animate="animate"
          />
        </div>
      </motion.div>

      {/* Decorative sparkles */}
      {[
        { x: '12%', y: '18%' },
        { x: '82%', y: '22%' },
        { x: '18%', y: '72%' },
        { x: '78%', y: '68%' },
        { x: '50%', y: '8%' },
      ].map((pos, i) => (
        <motion.svg
          key={i}
          className="absolute text-[color:var(--brand-green)]"
          style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          custom={i}
          variants={sparkleVariants}
          initial="hidden"
          animate="visible"
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </motion.svg>
      ))}
    </motion.div>
  );
}
