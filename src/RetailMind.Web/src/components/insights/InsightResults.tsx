import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BrainCircuit, AlertTriangle, ShieldCheck, Clock, TrendingUp, Package } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { DemandPredictionResponse, DeliveryPredictionResponse } from '../../services/mlApi';

interface ResultsProps {
  activeModel: 'demand' | 'delivery';
  isLoading: boolean;
  demandResult: DemandPredictionResponse | null;
  deliveryResult: DeliveryPredictionResponse | null;
}

export function InsightResults({ activeModel, isLoading, demandResult, deliveryResult }: ResultsProps) {
  
  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-6 text-slate-400">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full border-2 border-indigo-400 opacity-20"></div>
          <div className="absolute inset-2 animate-spin rounded-full border-t-2 border-l-2 border-indigo-500"></div>
          <BrainCircuit className="h-8 w-8 text-indigo-500 animate-pulse" />
        </div>
        <p className="text-sm font-semibold tracking-wider uppercase animate-pulse text-indigo-600">Executing Inference Model...</p>
      </div>
    );
  }

  // --- Initial State (No result yet) ---
  if ((activeModel === 'demand' && !demandResult) || (activeModel === 'delivery' && !deliveryResult)) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-slate-500">
        <div className="mb-6 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-100 shadow-inner">
          <BrainCircuit className="h-12 w-12 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Awaiting Inputs</h3>
        <p className="mt-2 text-sm max-w-sm leading-relaxed">
          Configure the parameters on the left and run the prediction model to instantiate deep learning insights.
        </p>
      </div>
    );
  }

  // --- DEMAND RESULTS ---
  if (activeModel === 'demand' && demandResult) {
    // Transform data for chart
    const chartData = [
      ...demandResult.historicalContext.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        // Historical only
        historical: d.sales,
        forecastLower: null,
        forecastUpper: null,
      })),
      {
        date: 'Forecast', // The predicted point
        historical: null,
        forecastPoint: demandResult.predictedSalesQuantity,
        forecastLower: demandResult.confidenceInterval[0],
        forecastUpper: demandResult.confidenceInterval[1],
      }
    ];

    return (
      <div className="flex h-full flex-col animate-in slide-in-from-right-8 fade-in duration-700">
        {/* Metric Header Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-between rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-6 py-5 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Forecasted Volume</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900">{demandResult.predictedSalesQuantity.toLocaleString()}</span>
              <span className="text-sm font-semibold text-slate-500">units</span>
            </div>
          </div>
          
          <div className="flex flex-col justify-between rounded-2xl border border-indigo-100 bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Target Horizon</span>
            </div>
            <div className="text-xl font-bold tracking-tight text-slate-900">
               {new Date(demandResult.targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Chart Layer */}
        <div className="group relative flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-shadow">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Demand Trajectory</h3>
              <p className="text-xs font-medium text-slate-500">Historical velocity vs AI 95% confidence interval</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-slate-300"></div> Historical</div>
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-indigo-500"></div> AI Projection</div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}
                />
                
                {/* Confidence Interval Band */}
                <Area type="monotone" dataKey="forecastUpper" stroke="none" fill="#e0e7ff" />
                <Area type="monotone" dataKey="forecastLower" stroke="none" fill="#fff" />
                
                <Area type="monotone" dataKey="historical" stroke="#94a3b8" strokeWidth={3} fillOpacity={1} fill="url(#colorHistorical)" />
                <Area type="monotone" dataKey="forecastPoint" stroke="#4f46e5" strokeWidth={3} strokeDasharray="6 6" fillOpacity={1} fill="url(#colorForecast)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-2 text-xs font-semibold text-slate-500">
           <span>Model: Stochastic Gradient Boosting</span>
           <span>Accuracy: ~94.2%</span>
        </div>
      </div>
    );
  }

  // --- DELIVERY RESULTS ---
  if (activeModel === 'delivery' && deliveryResult) {
    // Circle gauge properties
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (deliveryResult.confidenceScore / 100) * circumference;
    
    // SLA Color coding
    let slaColor = 'text-blue-500';
    let slaBg = 'bg-blue-50';
    if (deliveryResult.transitSla.includes('Next-Day')) { slaColor = 'text-amber-500'; slaBg = 'bg-amber-50'; }
    if (deliveryResult.transitSla.includes('Hyper')) { slaColor = 'text-purple-500'; slaBg = 'bg-purple-50'; }

    return (
      <div className="flex h-full flex-col animate-in slide-in-from-right-8 fade-in duration-700">
        <div className="mb-6 rounded-3xl bg-slate-900 p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-500/20">
          {/* Decorative background grid */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-white/20">
                 <Package className="h-4 w-4" /> Transit Route Optimal Prediction
              </div>
              <div>
                <div className="flex items-end justify-center md:justify-start gap-3">
                  <span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                    {deliveryResult.predictedDeliveryTimeMinutes}
                  </span>
                  <span className="text-2xl font-bold text-slate-400 pb-2">min</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-400">Estimated Total Journey Duration</p>
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={radius} className="stroke-white/10" strokeWidth="12" fill="none" />
                <circle cx="70" cy="70" r={radius} 
                  className="stroke-emerald-400 transition-all duration-1000 ease-out" 
                  strokeWidth="12" fill="none" 
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ strokeDashoffset: offset }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black">{deliveryResult.confidenceScore}<span className="text-base text-emerald-400">%</span></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confidence</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mt-4">
          <div className={cn("rounded-2xl p-6 border transition-colors", slaBg, slaColor.replace('text', 'border'))}>
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-6 w-6" />
              <h4 className="font-bold uppercase tracking-widest text-xs">Fulfillment SLA</h4>
            </div>
            <p className="text-xl font-bold text-slate-900">{deliveryResult.transitSla}</p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6">
            <div className="flex items-center gap-3 mb-4">
               <AlertTriangle className="h-5 w-5 text-rose-500" />
               <h4 className="font-bold uppercase tracking-widest text-xs text-rose-600">Risk Factors Detected</h4>
            </div>
            {deliveryResult.riskFactors.length > 0 ? (
              <ul className="space-y-2">
                {deliveryResult.riskFactors.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm font-medium text-slate-700 before:content-['•'] before:text-rose-400">
                    {risk}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Route clear of known blockages.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
