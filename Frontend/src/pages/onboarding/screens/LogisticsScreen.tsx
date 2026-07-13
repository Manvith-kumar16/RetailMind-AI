import React from 'react';
import { motion } from 'framer-motion';
import { Map, Truck, AlertTriangle, Clock } from 'lucide-react';

export const LogisticsScreen: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row items-center w-full max-w-5xl gap-12">
      <div className="flex-1 space-y-6 text-center md:text-left">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          Optimize Every Delivery
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-400 leading-relaxed max-w-lg"
        >
          Predict delivery delays using AI and monitor logistics before problems occur.
        </motion.p>
      </div>

      <div className="flex-1 relative w-full h-[400px] flex flex-col items-center justify-center">
        {/* Abstract Map Background */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-md aspect-[4/3] bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
        >
          {/* Map Icon Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Map className="w-64 h-64 text-slate-400" />
          </div>

          {/* Abstract Roads */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
            <path d="M 50 250 L 150 150 L 250 150 L 350 50" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Traffic Hotspot (Red) */}
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              d="M 150 150 L 250 150" 
              fill="none" 
              stroke="#F59E0B" 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>

          {/* Animated Truck */}
          <motion.div 
            initial={{ x: 30, y: 220 }}
            animate={{ x: 130, y: 120 }}
            transition={{ duration: 2, ease: "linear", delay: 0.5 }}
            className="absolute z-10 p-2 bg-blue-500 rounded-lg shadow-lg text-white -translate-x-1/2 -translate-y-1/2"
          >
            <Truck className="w-5 h-5" />
          </motion.div>

          {/* Logistics ETA Card */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', delay: 2.5 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-slate-800/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Delivery ETA</p>
                <p className="text-xl font-bold text-white">72 min</p>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700" />

            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Risk</p>
                <p className="text-xl font-bold text-amber-400">Medium</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
