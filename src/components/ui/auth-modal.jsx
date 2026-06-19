/**
 * @file auth-modal.jsx
 * @description Inline sign-in/register modal for guests (booking, checkout, favorites).
 *   Controlled by AuthModalContext (openAuthModal / closeAuthModal).
 *
 * @see contexts/AuthModalContext.jsx
 */
import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './button';

const backdropTransition = { duration: 0.28, ease: 'easeOut' };
const panelTransition = { duration: 0.38, ease: [0.22, 1, 0.36, 1] };

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.94, y: 12 },
};

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.1 + index * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function AuthModal({ isOpen, onClose, title, description }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const panelInitial = reduceMotion ? false : 'hidden';
  const panelAnimate = reduceMotion ? undefined : 'visible';
  const panelExit = reduceMotion ? undefined : 'exit';
  const contentInitial = reduceMotion ? false : 'hidden';
  const contentAnimate = reduceMotion ? undefined : 'visible';

  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-8"
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-md"
            variants={reduceMotion ? undefined : backdropVariants}
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={backdropTransition}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            aria-describedby="auth-modal-description"
            className="relative z-10 w-full max-w-md cursor-default rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
            variants={reduceMotion ? undefined : panelVariants}
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={panelTransition}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>

            <div className="text-center">
              <motion.div
                custom={0}
                variants={reduceMotion ? undefined : contentVariants}
                initial={contentInitial}
                animate={contentAnimate}
                className="mx-auto grid size-16 place-items-center rounded-full bg-[color:var(--brand-mist)]"
              >
                <svg
                  className="size-8 text-[color:var(--brand-green)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </motion.div>

              <motion.h3
                id="auth-modal-title"
                custom={1}
                variants={reduceMotion ? undefined : contentVariants}
                initial={contentInitial}
                animate={contentAnimate}
                className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl"
              >
                {title || 'Sign in to save favorites'}
              </motion.h3>

              <motion.p
                id="auth-modal-description"
                custom={2}
                variants={reduceMotion ? undefined : contentVariants}
                initial={contentInitial}
                animate={contentAnimate}
                className="mt-2 text-sm text-slate-600 sm:text-base"
              >
                {description ||
                  'Create an account or sign in to save your favorite tours and destinations for later.'}
              </motion.p>

              <motion.div
                custom={3}
                variants={reduceMotion ? undefined : contentVariants}
                initial={contentInitial}
                animate={contentAnimate}
                className="mt-6 flex flex-row items-center justify-center gap-3"
              >
                <Button asChild variant="default" size="lg" className="min-w-[148px] !text-white !bg-[#39AD6C] hover:!bg-[#39AD6C]/90">
                  <Link to="/signin" onClick={onClose}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="default" size="lg" className="min-w-[148px] !text-white !bg-[#39AD6C] hover:!bg-[#39AD6C]/90">
                  <Link to="/register" onClick={onClose}>
                    Create Account
                  </Link>
                </Button>
              </motion.div>

              <motion.p
                custom={4}
                variants={reduceMotion ? undefined : contentVariants}
                initial={contentInitial}
                animate={contentAnimate}
                className="mt-4 text-xs text-slate-500"
              >
                By continuing, you agree to our Terms of Service and Privacy Policy
              </motion.p>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
