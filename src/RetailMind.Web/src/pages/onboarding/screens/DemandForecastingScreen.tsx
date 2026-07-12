import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const DemandForecastingScreen: React.FC = () => {
  const [showPrediction, setShowPrediction] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPrediction(true);
    }, 1500); // Wait for historical line to draw before showing prediction
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center w-full max-w-6xl gap-12">
      <div className="flex-1 space-y-6 text-center md:text-left">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          Predict Tomorrow's Demand Today
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-400 leading-relaxed max-w-lg"
        >
          Machine Learning analyzes historical sales, pricing, promotions, and seasonal trends to forecast future product demand.
        </motion.p>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-lg bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-2xl"
        >
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-white font-semibold">Demand Forecast: Rice</h3>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-3 h-3 rounded-full bg-blue-500" /> Historical
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-3 h-3 rounded-full bg-violet-500" /> Prediction
              </div>
            </div>
          </div>

          <div className="relative h-[250px] w-full border-b border-l border-slate-700/50">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-20 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-px bg-slate-500" />
              ))}
            </div>

            {/* SVG Chart */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Historical Data Line */}
              <motion.path
                d="M 0 80 Q 15 75, 25 60 T 50 50"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />

              {/* Prediction Line */}
              {showPrediction && (
                <motion.path
                  d="M 50 50 Q 70 30, 85 20 T 100 10"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              )}
            </svg>

            {/* Animated Tooltip */}
            <AnimatePresence>
              {showPrediction && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.2, type: 'spring' }}
                  className="absolute top-[5%] right-[0%] translate-x-1/2 -translate-y-full bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl whitespace-nowrap z-10"
                >
                  <div className="text-emerald-400 font-bold text-lg">+18% Demand</div>
                  <div className="text-slate-400 text-xs mt-1">Confidence 94%</div>
                  
                  {/* Tooltip triangle */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 border-b border-r border-slate-700 transform rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glowing point at junction */}
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] z-0"
            />
          </div>

          <div className="flex justify-between mt-4 text-xs text-slate-500 font-medium">
            <span>Last Week</span>
            <span>Today</span>
            <span>Next Week</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
