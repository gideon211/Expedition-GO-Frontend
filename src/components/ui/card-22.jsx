import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock3, MapPin, Star, UserRoundCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PlaceCard({
  images,
  rating,
  title,
  supplierName,
  supplierLogo,
  location,
  duration,
  className,
}) {
  const safeImages = images?.filter(Boolean)?.length ? images.filter(Boolean) : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const currentImage = safeImages[currentIndex];

  const changeImage = (newDirection) => {
    if (safeImages.length <= 1) return;
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) return safeImages.length - 1;
      if (nextIndex >= safeImages.length) return 0;
      return nextIndex;
    });
  };

  const carouselVariants = {
    enter: (animationDirection) => ({
      x: animationDirection > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (animationDirection) => ({
      zIndex: 0,
      x: animationDirection < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900',
        className
      )}
    >
      <motion.div 
        className="group relative h-64 overflow-hidden bg-slate-100"
        whileHover={{
          scale: 1.05,
          transition: { type: 'spring', stiffness: 260, damping: 22 },
        }}
      >
        {currentImage ? (
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={currentImage}
              src={currentImage}
              alt={title}
              custom={direction}
              variants={carouselVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute h-full w-full object-cover"
            />
          </AnimatePresence>
        ) : (
          <div className="grid h-full w-full place-items-center bg-slate-100 text-sm font-semibold text-slate-400">
            No tour image
          </div>
        )}

        {safeImages.length > 1 && (
          <div className="absolute inset-0 z-10 flex items-center justify-between p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 rounded-full bg-black/35 text-white hover:bg-black/50"
              onClick={() => changeImage(-1)}
              aria-label="Previous tour image"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 rounded-full bg-black/35 text-white hover:bg-black/50"
              onClick={() => changeImage(1)}
              aria-label="Next tour image"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        )}

        {safeImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {safeImages.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  currentIndex === index ? 'w-4 bg-white' : 'w-1.5 bg-white/55'
                )}
                aria-label={`Go to tour image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </motion.div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-[color:var(--brand-green)]" />
              <span className="min-w-0 truncate text-xs font-black tracking-[0.18em] text-[color:var(--brand-green)]">
                {location}
              </span>
            </div>
          )}
          <h3 className="text-xl font-black leading-tight text-slate-950">{title}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-slate-700">
            {rating != null && (
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-emerald-600 text-emerald-600" />
                <span className="text-slate-950">{rating}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-1">
                <Clock3 className="size-4 text-[color:var(--brand-green)]" />
                <span>{duration}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-white text-xs font-black text-[color:var(--brand-green)]">
            {supplierLogo ? (
              <img src={supplierLogo} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserRoundCheck className="size-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">Posted by</p>
            <p className="truncate text-sm font-black text-slate-900">{supplierName}</p>
          </div>
        </div>

      </div>
    </motion.article>
  );
}
