'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OnboardingTour() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    // Adding small delay for smooth mount
    const timer = setTimeout(() => {
      const hasSeenTour = localStorage.getItem('elevate_tour_completed');
      if (!hasSeenTour) {
        setShow(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const completeTour = () => {
    localStorage.setItem('elevate_tour_completed', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
          className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl"
        >
          <button
            onClick={completeTour}
            className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 shadow-[0_10px_20px_-10px_rgba(34,211,238,0.8)]">
            <Sparkles className="h-6 w-6" />
          </div>
          
          <h3 className="mb-2 text-xl font-bold text-white tracking-tight">Welcome to Elevate OS</h3>
          <p className="mb-6 text-sm leading-relaxed text-slate-300">
            Experience the new premium standard in operations. 
            Press <kbd className="mx-1 rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white">Cmd+K</kbd> anywhere to access the command palette, or chat with the AI Assistant in the bottom right corner.
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <div className="h-1.5 w-6 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            </div>
            <Button onClick={completeTour} className="bg-white text-slate-950 hover:bg-slate-200 transition-all font-semibold rounded-full px-6">
              Get Started
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
