import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { destinations } from "./data";
import { DestinationCard } from "./DestinationCard";

export function DestinationsModal({ isOpen, onClose }) {
  const [selectedRegion, setSelectedRegion] = useState("all");

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const regions = [
    { id: "all", name: "All Regions" },
    { id: "east-asia", name: "East Asia" },
    { id: "southeast-asia", name: "South East Asia" },
    { id: "south-asia", name: "South Asia / Middle East" },
    { id: "oceania", name: "Oceania" },
    { id: "europe", name: "Europe" },
    { id: "north-america", name: "North America" }
  ];

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[70] cursor-pointer bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          />

          {/* Slide-out Panel */}
          <motion.div
            className="fixed right-0 top-0 z-[80] h-screen w-full max-w-2xl bg-white shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          >
        {/* Header - Fixed */}
        <div className="border-b border-slate-200 bg-white px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Where to next?</h2>
            <button
              onClick={onClose}
              className="grid size-10 place-items-center rounded-full hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="size-6 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable with visible scrollbar */}
        <div className="flex-1 overflow-y-scroll px-6 py-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {/* Popular Destinations */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Popular destinations</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {destinations.slice(0, 6).map((dest, index) => (
                <div key={`${dest.title}-${index}`} className="cursor-pointer hover:opacity-80 transition">
                  <DestinationCard {...dest} />
                </div>
              ))}
            </div>
            <button className="w-full rounded-lg border-2 border-slate-300 py-3 font-semibold text-[color:var(--brand-green)] transition hover:border-[color:var(--brand-green)]/35 hover:bg-[color:var(--brand-mist)]">
              See more <ChevronDown className="inline size-4 ml-1" />
            </button>
          </div>

          {/* Regions */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {regions.map(region => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedRegion === region.id
                      ? "bg-[color:var(--brand-green)] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>

          {/* Region Destinations */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Hong Kong & Macau</h3>
              <a href="#" className="text-sm font-semibold text-[color:var(--brand-green)] hover:underline">
                Explore
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {destinations.slice(0, 2).map((dest, index) => (
                <div key={`region-${dest.title}-${index}`} className="cursor-pointer hover:opacity-80 transition">
                  <DestinationCard {...dest} />
                </div>
              ))}
            </div>
          </div>

          {/* Additional sections for scrolling */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Southeast Asia</h3>
              <a href="#" className="text-sm font-semibold text-[color:var(--brand-green)] hover:underline">
                Explore
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {destinations.slice(2, 4).map((dest, index) => (
                <div key={`sea-${dest.title}-${index}`} className="cursor-pointer hover:opacity-80 transition">
                  <DestinationCard {...dest} />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Europe</h3>
              <a href="#" className="text-sm font-semibold text-[color:var(--brand-green)] hover:underline">
                Explore
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {destinations.slice(4, 6).map((dest, index) => (
                <div key={`eu-${dest.title}-${index}`} className="cursor-pointer hover:opacity-80 transition">
                  <DestinationCard {...dest} />
                </div>
              ))}
            </div>
          </div>
        </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
