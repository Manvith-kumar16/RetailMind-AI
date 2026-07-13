import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Store, Truck, Warehouse } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row items-center w-full max-w-5xl gap-12">
      <div className="flex-1 space-y-6 text-center md:text-left">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          Welcome to RetailMind AI
        </motion.h1>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-medium text-blue-400"
        >
          AI-Powered Retail & Supply Chain Intelligence
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-slate-400 leading-relaxed max-w-lg"
        >
          Manage inventory, orders, logistics, employees, and AI-powered insights—all from one enterprise platform.
        </motion.p>
      </div>

      <div className="flex-1 relative w-full h-[400px] flex items-center justify-center">
        {/* Isometric glowing composition */}
        <div className="relative w-full h-full flex items-center justify-center">
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, delay: 0.4 }}
            className="absolute z-10 bg-violet-600/20 p-6 rounded-full border border-violet-500/30 shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] backdrop-blur-md"
          >
            <BrainCircuit className="w-16 h-16 text-violet-400" strokeWidth={1.5} />
          </motion.div>

          <motion.div 
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: -100, y: -80, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, delay: 0.5 }}
            className="absolute bg-slate-900/80 p-4 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-md"
          >
            <Store className="w-8 h-8 text-blue-400" strokeWidth={1.5} />
          </motion.div>

          <motion.div 
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: 100, y: -80, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, delay: 0.6 }}
            className="absolute bg-slate-900/80 p-4 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-md"
          >
            <Warehouse className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
          </motion.div>

          <motion.div 
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: 0, y: 100, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, delay: 0.7 }}
            className="absolute bg-slate-900/80 p-4 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-md"
          >
            <Truck className="w-8 h-8 text-amber-400" strokeWidth={1.5} />
          </motion.div>

          {/* Connection lines (simplified with CSS for visual) */}
          <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <motion.line 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 1, delay: 0.8 }}
              x1="50%" y1="50%" x2="30%" y2="30%" 
              stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4 4" 
            />
            <motion.line 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 1, delay: 0.9 }}
              x1="50%" y1="50%" x2="70%" y2="30%" 
              stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4 4" 
            />
            <motion.line 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 1, delay: 1 }}
              x1="50%" y1="50%" x2="50%" y2="75%" 
              stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4 4" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
