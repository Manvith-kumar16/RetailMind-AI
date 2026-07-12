import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const GetStartedScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl text-center space-y-12">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-violet-600/30 blur-[100px] rounded-full" />
        <div className="relative p-6 bg-slate-900/50 backdrop-blur-md rounded-full border border-slate-700/50 shadow-2xl inline-flex items-center justify-center">
          <Sparkles className="w-16 h-16 text-blue-400" strokeWidth={1.5} />
        </div>
      </motion.div>

      <div className="space-y-6 max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-white"
        >
          Let's Build Smarter Retail
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-400 leading-relaxed"
        >
          You're ready to experience AI-powered retail management.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 pt-8"
      >
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-8 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)] w-full sm:w-auto"
        >
          Launch Demo Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-semibold py-4 px-8 rounded-full transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
        >
          Sign In
        </button>
      </motion.div>
    </div>
  );
};
