import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Package } from 'lucide-react';

export const InventoryScreen: React.FC = () => {
  const [stock, setStock] = useState(50);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Animate stock down
    const interval = setInterval(() => {
      setStock((prev) => {
        if (prev <= 5) {
          clearInterval(interval);
          setShowAlert(true);
          return 5;
        }
        return prev - Math.floor(Math.random() * 5) - 1;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl text-center space-y-12">
      <div className="space-y-4 max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          Never Run Out of Stock Again
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-400 leading-relaxed"
        >
          Monitor inventory in real time, receive low-stock alerts, and keep shelves stocked before customers notice.
        </motion.p>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className={`relative w-full max-w-md p-8 rounded-3xl border transition-colors duration-500 shadow-2xl backdrop-blur-xl bg-slate-900/60 ${
          showAlert ? 'border-amber-500/50 shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]' : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-2xl">
              <Package className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Premium Milk</h3>
              <p className="text-slate-400">Dairy Category</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Stock</p>
            <p className={`text-4xl font-bold transition-colors ${showAlert ? 'text-amber-400' : 'text-white'}`}>
              {stock}
            </p>
          </div>
        </div>

        <div className="h-20 flex items-center justify-center">
          <AnimatePresence>
            {showAlert && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-full flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-3 text-amber-500 font-medium">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Low Stock Alert</span>
                </div>
                <div className="text-right text-sm">
                  <span className="text-slate-400">Recommended Reorder: </span>
                  <span className="text-emerald-400 font-bold">120 units</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
