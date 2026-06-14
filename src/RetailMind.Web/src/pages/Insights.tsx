import { useState } from 'react';
import { Sparkles, BarChart2, Truck, AlertCircle } from 'lucide-react';
import { PredictionForms } from '../components/insights/PredictionForms';
import { InsightResults } from '../components/insights/InsightResults';
import { mlApi } from '../services/mlApi';
import type { DemandPredictionResponse, DeliveryPredictionResponse } from '../services/mlApi';
import { cn } from '../utils/cn';

export function Insights() {
  const [activeModel, setActiveModel] = useState<'demand' | 'delivery'>('demand');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [demandResult, setDemandResult] = useState<DemandPredictionResponse | null>(null);
  const [deliveryResult, setDeliveryResult] = useState<DeliveryPredictionResponse | null>(null);

  const handleRunDemand = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await mlApi.predictDemand(data);
      setDemandResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to execute demand inference model.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunDelivery = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await mlApi.predictDelivery(data);
      setDeliveryResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to execute delivery inference model.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden bg-slate-50/50 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header Banner */}
      <div className="shrink-0 relative mb-6 overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
        {/* Decorative Grid / Particles backdrop */}
        <div className="absolute inset-0 z-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
        <div className="absolute top-0 right-0 -m-32 h-[300px] w-[300px] rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>
        <div className="absolute bottom-0 right-32 -m-32 h-[300px] w-[300px] rounded-full bg-emerald-500 opacity-20 blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-between sm:flex-row gap-6">
          <div className="max-w-2xl">
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white mb-2">
              <Sparkles className="h-8 w-8 text-indigo-400" /> 
              RetailMind <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-300">AI Intelligence</span>
            </h1>
            <p className="text-sm font-semibold text-slate-400 max-w-xl leading-relaxed">
              Run predictive forecasting and logistics models backed by enterprise machine learning architectures to optimize your supply chain in real-time.
            </p>
          </div>
          
          {/* Animated Tab Switcher */}
          <div className="flex p-1.5 rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur-md shrink-0">
            <button
              disabled={isLoading}
              onClick={() => setActiveModel('demand')}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                activeModel === 'demand' ? "bg-white text-indigo-700 shadow-xl" : "text-slate-300 hover:text-white"
              )}
            >
              <BarChart2 className="h-4 w-4" /> Demand Engine
            </button>
            <button
              disabled={isLoading}
              onClick={() => setActiveModel('delivery')}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                activeModel === 'delivery' ? "bg-white text-emerald-700 shadow-xl" : "text-slate-300 hover:text-white"
              )}
            >
              <Truck className="h-4 w-4" /> Transit Router
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 shrink-0 shadow-sm animate-in slide-in-from-top-2">
           <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
           <p className="text-sm font-semibold text-red-800">{error}</p>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Forms */}
        <div className="lg:col-span-4 flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 overflow-hidden">
          <PredictionForms 
            activeModel={activeModel} 
            isLoading={isLoading} 
            onDemandSubmit={handleRunDemand} 
            onDeliverySubmit={handleRunDelivery} 
          />
        </div>

        {/* Right Column: Dynamic Data Layer */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-inner md:p-8 p-4 overflow-hidden relative">
          <InsightResults 
            activeModel={activeModel} 
            isLoading={isLoading} 
            demandResult={demandResult} 
            deliveryResult={deliveryResult} 
          />
        </div>

      </div>

    </div>
  );
}
