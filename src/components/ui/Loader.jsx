import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './loader.css';

export default function Loader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className="loader-overlay"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ 
            duration: 0.18,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ 
              duration: 0.22,
              ease: [0.34, 1.56, 0.64, 1], // Bouncy ease-out
            }}
          >
            <div className="loader" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
