/**
 * @file EmptyCartIllustration.jsx
 * @description Animated SVG illustration for the empty cart page.
 *   A wireframe shopping cart with items that float up and fade away,
 *   leaving an empty cart that gently bounces. Sparkles drift around
 *   the empty cart to invite the user to add items.
 */
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 14,
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const cartPartVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 110, damping: 12 },
  },
};

const itemFloatOut = (delay = 0) => ({
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 12, delay },
  },
});

const itemExit = (delay = 0) => ({
  opacity: [1, 1, 0],
  y: [0, -10, -70],
  scale: [1, 1.05, 0.85],
  transition: {
    duration: 1.4,
    delay,
    ease: 'easeInOut',
    times: [0, 0.4, 1],
  },
});

const sparkleVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i) => ({
    opacity: [0, 0.8, 0],
    scale: [0, 1, 0],
    y: [0, -12, -24],
    x: [0, (i % 2 === 0 ? 1 : -1) * 8, (i % 2 === 0 ? 1 : -1) * 14],
    transition: {
      duration: 2.2,
      delay: 2.8 + i * 0.35,
      repeat: Infinity,
      repeatDelay: 1.5,
      ease: 'easeInOut',
    },
  }),
};

export function EmptyCartIllustration({ className = '' }) {
  return (
    <motion.svg
      viewBox="0 0 460 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Ground line */}
      <motion.line
        x1="20"
        y1="286"
        x2="440"
        y2="286"
        stroke="#E2E8F0"
        strokeWidth="2"
        strokeLinecap="round"
        variants={cartPartVariants}
      />

      {/* Cart wireframe body */}
      <motion.g
        variants={cartPartVariants}
        animate={{ y: [-2.5, 2.5, -2.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
      >
        {/* Main basket trapezoid */}
        <path
          d="M130 120 L170 230 L360 230 L390 120"
          stroke="#94A3B8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Top rim */}
        <path
          d="M130 120 L390 120"
          stroke="#64748B"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bottom rim */}
        <path
          d="M170 230 L360 230"
          stroke="#64748B"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Vertical wire lines */}
        <path d="M155 120 L180 230" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M180 120 L198 230" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M205 120 L216 230" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M230 120 L234 230" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M255 120 L252 230" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M280 120 L270 230" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M305 120 L288 230" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M330 120 L306 230" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M355 120 L324 230" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M375 120 L342 230" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Horizontal wire lines */}
        <path d="M138 145 L382 145" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M146 170 L374 170" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M154 195 L366 195" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M162 220 L358 220" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Handle */}
        <path d="M130 120 L60 55" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Handle grip */}
        <circle cx="55" cy="50" r="10" fill="#1A1A2E" />
        <circle cx="55" cy="50" r="4" fill="#475569" />

        {/* Bottom support legs */}
        <path d="M210 230 L195 275" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M320 230 L335 275" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M195 275 L335 275" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Front lip */}
        <path d="M390 120 L402 125 L397 135 L385 130Z" fill="#94A3B8" />
      </motion.g>

      {/* Wheels */}
      <motion.g
        variants={cartPartVariants}
        animate={{ y: [-2.5, 2.5, -2.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
      >
        <circle cx="215" cy="275" r="13" fill="#1A1A2E" />
        <circle cx="215" cy="275" r="5" fill="#475569" />
        <line x1="215" y1="262" x2="215" y2="288" stroke="#334155" strokeWidth="2" />
        <line x1="202" y1="275" x2="228" y2="275" stroke="#334155" strokeWidth="2" />

        <circle cx="315" cy="275" r="13" fill="#1A1A2E" />
        <circle cx="315" cy="275" r="5" fill="#475569" />
        <line x1="315" y1="262" x2="315" y2="288" stroke="#334155" strokeWidth="2" />
        <line x1="302" y1="275" x2="328" y2="275" stroke="#334155" strokeWidth="2" />
      </motion.g>

      {/* Items inside cart - they float out and disappear */}

      {/* Blue jar with botanical pattern */}
      <motion.g
        variants={itemFloatOut(0.3)}
        animate={itemExit(1.2)}
      >
        <rect x="175" y="148" width="42" height="72" rx="6" fill="#BFDBFE" />
        <rect x="175" y="148" width="42" height="14" rx="4" fill="#93C5FD" />
        {/* Leaf pattern */}
        <path d="M185 175 Q190 168 195 175 Q190 182 185 175Z" fill="#3B82F6" opacity="0.5" />
        <path d="M200 185 Q205 178 210 185 Q205 192 200 185Z" fill="#3B82F6" opacity="0.4" />
        <path d="M188 198 Q193 191 198 198 Q193 205 188 198Z" fill="#3B82F6" opacity="0.35" />
        <circle cx="196" cy="172" r="1.5" fill="#60A5FA" opacity="0.6" />
        <circle cx="182" cy="190" r="1.5" fill="#60A5FA" opacity="0.5" />
        <circle cx="208" cy="205" r="1.5" fill="#60A5FA" opacity="0.4" />
      </motion.g>

      {/* Dark bottle behind */}
      <motion.g
        variants={itemFloatOut(0.5)}
        animate={itemExit(1.6)}
      >
        <rect x="215" y="138" width="22" height="82" rx="4" fill="#1E293B" />
        <rect x="218" y="130" width="16" height="12" rx="2" fill="#334155" />
        <rect x="220" y="155" width="12" height="28" rx="2" fill="#0F172A" />
      </motion.g>

      {/* Coral-red tall bottle */}
      <motion.g
        variants={itemFloatOut(0.7)}
        animate={itemExit(2.0)}
      >
        <path d="M248 125 L248 95 Q248 90 253 90 L263 90 Q268 90 268 95 L268 125 L272 220 L244 220Z" fill="#F87171" />
        <rect x="248" y="145" width="20" height="45" rx="2" fill="#1A1A2E" />
        <rect x="250" y="148" width="16" height="38" rx="1" fill="#DC2626" opacity="0.3" />
        <rect x="252" y="100" width="12" height="18" rx="2" fill="#EF4444" />
      </motion.g>

      {/* Light blue bottle */}
      <motion.g
        variants={itemFloatOut(0.9)}
        animate={itemExit(2.4)}
      >
        <path d="M290 155 L290 130 Q290 125 296 125 L312 125 Q318 125 318 130 L318 155 L322 220 L286 220Z" fill="#A5B4FC" />
        <rect x="292" y="158" width="24" height="30" rx="3" fill="#818CF8" opacity="0.4" />
        <rect x="298" y="132" width="12" height="16" rx="2" fill="#C7D2FE" />
      </motion.g>

      {/* Floating sparkles that appear after items leave */}
      {[0, 1, 2, 3, 4].map((i) => {
        const cx = 230 + i * 28;
        const cy = 180 + (i % 3) * 15;
        return (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={2.5 + (i % 2) * 1.5}
            fill={i % 2 === 0 ? '#FBBF24' : '#F472B6'}
            custom={i}
            variants={sparkleVariants}
            initial="hidden"
            animate="visible"
          />
        );
      })}

      {/* Small plus signs as sparkles */}
      {[
        { x: 200, y: 160 },
        { x: 340, y: 150 },
        { x: 260, y: 130 },
      ].map((pos, i) => (
        <motion.g
          key={`plus-${i}`}
          custom={i + 5}
          variants={sparkleVariants}
          initial="hidden"
          animate="visible"
        >
          <line x1={pos.x} y1={pos.y - 5} x2={pos.x} y2={pos.y + 5} stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1={pos.x - 5} y1={pos.y} x2={pos.x + 5} y2={pos.y} stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      ))}
    </motion.svg>
  );
}
