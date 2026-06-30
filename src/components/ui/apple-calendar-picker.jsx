"use client";
import React, { useState, useEffect, useRef } from 'react';

// --- ICONS ---
const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
);

// --- MONTH NAMES ---
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// --- APPLE-STYLE MONTH/YEAR PICKER ---
export const AppleCalendarPicker = ({ isOpen, onClose, onDateSelect, initialDate }) => {
  const today = initialDate ? new Date(initialDate) : new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  
  const pickerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Generate list of months/years (past 2 years to current)
  const generateMonthYearList = () => {
    const list = [];
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear() - 2, 0, 1); // 2 years ago
    const endDate = currentDate;

    let iterDate = new Date(endDate);
    
    // Generate from current month backwards
    while (iterDate >= startDate) {
      list.push({
        year: iterDate.getFullYear(),
        month: iterDate.getMonth(),
        display: `${MONTH_NAMES[iterDate.getMonth()]} ${iterDate.getFullYear()}`
      });
      iterDate.setMonth(iterDate.getMonth() - 1);
    }
    
    return list;
  };

  const monthYearList = generateMonthYearList();

  // Scroll to selected item on open (within container only, no page scroll)
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const selectedIndex = monthYearList.findIndex(
        item => item.year === selectedYear && item.month === selectedMonth
      );
      
      if (selectedIndex !== -1) {
        // Delay to ensure DOM is ready
        setTimeout(() => {
          const selectedElement = scrollContainerRef.current?.children[selectedIndex];
          const container = scrollContainerRef.current;
          if (selectedElement && container) {
            // Calculate scroll position to center the selected item without scrolling the page
            const elementTop = selectedElement.offsetTop;
            const elementHeight = selectedElement.offsetHeight;
            const containerHeight = container.clientHeight;
            const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);
            
            // Scroll within container only
            container.scrollTop = scrollPosition;
          }
        }, 50);
      }
    }
  }, [isOpen, selectedYear, selectedMonth, monthYearList]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectMonthYear = (year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    
    // Create date on the 1st of selected month
    const selectedDate = new Date(year, month, 1);
    
    if (onDateSelect) {
      onDateSelect(selectedDate);
    }
    
    // Auto close after selection
    setTimeout(() => {
      if (onClose) onClose();
    }, 200);
  };

  return (
    <div 
      ref={pickerRef}
      className="absolute left-0 top-[calc(100%+8px)] z-50 w-full min-w-[280px] max-w-[380px] bg-white border border-slate-200/80 rounded-[20px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <span className="text-[15px] font-semibold text-[#0b4f2b]">
          {MONTH_NAMES[selectedMonth]} {selectedYear}
        </span>
        <ChevronUpIcon />
      </div>

      {/* Scrollable Month/Year List */}
      <div 
        ref={scrollContainerRef}
        className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400"
      >
        {monthYearList.map((item, index) => {
          const isSelected = item.year === selectedYear && item.month === selectedMonth;
          
          return (
            <button
              key={`${item.year}-${item.month}`}
              onClick={() => handleSelectMonthYear(item.year, item.month)}
              className={`w-full px-5 py-3.5 text-left text-[16px] font-medium transition-colors focus:outline-none ${
                isSelected
                  ? 'bg-slate-100 text-[#0b4f2b] font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.display}
            </button>
          );
        })}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};
