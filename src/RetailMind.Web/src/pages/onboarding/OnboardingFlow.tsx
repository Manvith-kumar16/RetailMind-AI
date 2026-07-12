import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { DemandForecastingScreen } from './screens/DemandForecastingScreen';
import { LogisticsScreen } from './screens/LogisticsScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { GetStartedScreen } from './screens/GetStartedScreen';

const screens = [
  WelcomeScreen,
  InventoryScreen,
  DemandForecastingScreen,
  LogisticsScreen,
  DashboardScreen,
  GetStartedScreen
];

export const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < screens.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(screens.length - 1);
  };

  const CurrentScreen = screens[currentStep];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full h-full flex items-center justify-center"
          >
            <CurrentScreen />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="relative z-20 flex flex-col items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800/50">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* Skip Button */}
          <div className="w-24">
            {currentStep < screens.length - 1 && (
              <button 
                onClick={handleSkip}
                className="text-slate-400 hover:text-white font-medium transition-colors px-4 py-2"
              >
                Skip
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2 items-center justify-center flex-1">
            {screens.map((_, index) => (
              <div 
                key={index} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'w-6 bg-blue-500' 
                    : 'w-2 bg-slate-700'
                }`} 
              />
            ))}
          </div>

          {/* Next Button */}
          <div className="w-24 flex justify-end">
            {currentStep < screens.length - 1 && (
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 text-white font-medium hover:text-blue-400 transition-colors px-4 py-2"
              >
                Next <span aria-hidden="true">&rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
