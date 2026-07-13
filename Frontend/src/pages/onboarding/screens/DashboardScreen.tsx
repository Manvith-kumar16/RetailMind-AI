import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, ShoppingCart, TrendingUp } from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const cards = [
    { title: "Inventory", icon: <ShoppingCart className="text-blue-400" />, value: "1,204", label: "+12% this week", color: "border-blue-500/30" },
    { title: "Demand", icon: <TrendingUp className="text-violet-400" />, value: "High", label: "94% confidence", color: "border-violet-500/30" },
    { title: "Orders", icon: <BarChart3 className="text-emerald-400" />, value: "482", label: "Pending fulfillment", color: "border-emerald-500/30" },
    { title: "Employees", icon: <Users className="text-amber-400" />, value: "24", label: "Active shifts", color: "border-amber-500/30" }
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-5xl gap-12 text-center">
      <div className="space-y-4 max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          One Dashboard. Complete Control.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-400 leading-relaxed"
        >
          Track inventory, orders, employees, AI insights, and business performance from one intelligent dashboard.
        </motion.p>
      </div>

      <div className="relative w-full max-w-3xl perspective-1000 h-[350px] flex items-center justify-center">
        {/* Animated cascading grid */}
        <motion.div 
          className="grid grid-cols-2 gap-4 md:gap-6 w-full"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.2 }
            }
          }}
          initial="hidden"
          animate="show"
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(15deg)' }}
        >
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 50, rotateX: 30 },
                show: { opacity: 1, y: 0, rotateX: 0 }
              }}
              whileHover={{ scale: 1.05, translateZ: 20, rotateX: 0, boxShadow: "0 20px 40px -10px rgba(139, 92, 246, 0.2)" }}
              className={`bg-slate-900/60 backdrop-blur-xl border ${card.color} p-6 rounded-3xl shadow-xl transition-all duration-300 text-left cursor-default`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-2xl">
                  {card.icon}
                </div>
              </div>
              <h3 className="text-slate-400 font-medium mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-white mb-2">{card.value}</p>
              <p className="text-sm text-slate-500">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
