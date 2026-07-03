import { motion } from 'framer-motion';

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const transition = {
  duration: 0.25,
  ease: 'easeInOut',
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
}
