import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Truck, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

// Zod schemas
const demandSchema = z.object({
  productId: z.coerce.number().min(1, 'Product ID is required'),
  date: z.string().min(1, 'Target forecasting date is required'),
  price: z.coerce.number().min(0, 'Target price must be >= 0'),
  promotion: z.enum(['Yes', 'No']),
});

const deliverySchema = z.object({
  distance: z.coerce.number().min(1, 'Estimated transit distance (km) required'),
  orderVolume: z.coerce.number().min(1, 'Order volume (items) required'),
  trafficLevel: z.enum(['Low', 'Medium', 'High']),
  weather: z.enum(['Clear', 'Rain', 'Snow']),
});

type DemandFormValues = z.infer<typeof demandSchema>;
type DeliveryFormValues = z.infer<typeof deliverySchema>;

interface FormProps {
  onDemandSubmit: (data: DemandFormValues) => void;
  onDeliverySubmit: (data: DeliveryFormValues) => void;
  activeModel: 'demand' | 'delivery';
  isLoading: boolean;
}

export function PredictionForms({ onDemandSubmit, onDeliverySubmit, activeModel, isLoading }: FormProps) {
  const demandForm = useForm<DemandFormValues>({
    resolver: zodResolver(demandSchema) as any,
    defaultValues: { productId: 101, date: new Date().toISOString().split('T')[0], price: 99.99, promotion: 'No' },
  });

  const deliveryForm = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema) as any,
    defaultValues: { distance: 45, orderVolume: 120, trafficLevel: 'Medium', weather: 'Clear' },
  });

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col pt-2">
      <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-6 px-1 flex items-center gap-2">
        {activeModel === 'demand' ? <Activity className="h-5 w-5 text-indigo-500" /> : <Truck className="h-5 w-5 text-emerald-500" />}
        Model Input Parameters
      </h2>

      {/* Demand Form */}
      <div className={cn("transition-all duration-500 absolute w-full inset-0 top-16 pt-2 px-1 pb-10", 
        activeModel === 'demand' ? "translate-x-0 opacity-100 relative" : "-translate-x-full opacity-0 pointer-events-none")}>
        <form onSubmit={demandForm.handleSubmit(onDemandSubmit)} className="space-y-6">
          <div className="space-y-1.5 group">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Product ID</label>
            <input type="number" 
              className={cn("w-full rounded-xl border bg-slate-50 p-3 pl-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10", demandForm.formState.errors.productId ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-indigo-500 group-hover:border-indigo-300")}
              {...demandForm.register('productId')} 
            />
          </div>

          <div className="space-y-1.5 group">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Forecast Horizon (Date)</label>
            <input type="date" 
              className={cn("w-full rounded-xl border bg-slate-50 p-3 pl-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10", demandForm.formState.errors.date ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-indigo-500 group-hover:border-indigo-300")}
              {...demandForm.register('date')} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 group">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Price ($)</label>
              <input type="number" step="0.01"
                className={cn("w-full rounded-xl border bg-slate-50 p-3 pl-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10", demandForm.formState.errors.price ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-indigo-500 group-hover:border-indigo-300")}
                {...demandForm.register('price')} 
              />
            </div>
            <div className="space-y-1.5 group">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Marketing Promotion</label>
              <select 
                className={cn("w-full rounded-xl border bg-slate-50 p-3 pl-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10", demandForm.formState.errors.promotion ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-indigo-500 group-hover:border-indigo-300")}
                {...demandForm.register('promotion')} 
              >
                <option value="No">No (Standard Baseline)</option>
                <option value="Yes">Yes (Active Campaign)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-3.5 px-4 text-sm font-bold text-white transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/20 active:translate-y-0 disabled:opacity-75 disabled:hover:translate-y-0 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? 'Running Inference Model...' : 'Run Demand Prediction'}
              {!isLoading && <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </span>
          </button>
        </form>
      </div>

      {/* Delivery Form */}
      <div className={cn("transition-all duration-500 absolute w-full inset-0 top-16 pt-2 px-1 pb-10", 
        activeModel === 'delivery' ? "translate-x-0 opacity-100 relative" : "translate-x-full opacity-0 pointer-events-none")}>
        <form onSubmit={deliveryForm.handleSubmit(onDeliverySubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 group">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Routing Distance (km)</label>
              <input type="number" step="0.1"
                className={cn("w-full rounded-xl border bg-slate-50 p-3 pl-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10", deliveryForm.formState.errors.distance ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-emerald-500 group-hover:border-emerald-300")}
                {...deliveryForm.register('distance')} 
              />
            </div>
            <div className="space-y-1.5 group">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Volume</label>
              <input type="number"
                className={cn("w-full rounded-xl border bg-slate-50 p-3 pl-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10", deliveryForm.formState.errors.orderVolume ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-emerald-500 group-hover:border-emerald-300")}
                {...deliveryForm.register('orderVolume')} 
              />
            </div>
          </div>

          <div className="space-y-1.5 group">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">City Traffic Congestion Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['Low', 'Medium', 'High'].map((level) => (
                <label key={level} className={cn("flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-semibold transition-all hover:bg-slate-50", deliveryForm.watch('trafficLevel') === level ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20" : "border-slate-200 text-slate-600 bg-white")}>
                  <input type="radio" value={level} className="sr-only" {...deliveryForm.register('trafficLevel')} />
                  {level}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 group flex flex-col pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Atmospheric Condition</label>
            <select 
              className={cn("w-full rounded-xl border bg-slate-50 p-3 pl-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10", deliveryForm.formState.errors.weather ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-emerald-500 group-hover:border-emerald-300")}
              {...deliveryForm.register('weather')} 
            >
              <option value="Clear">Clear Sky / Optimum Visibility</option>
              <option value="Rain">Precipitation / Rain</option>
              <option value="Snow">Blizzard / Snow Condition</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3.5 px-4 text-sm font-bold text-white transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-emerald-500/20 active:translate-y-0 disabled:opacity-75 disabled:hover:translate-y-0 disabled:cursor-not-allowed group relative overflow-hidden mt-4"
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? 'Running Inference Model...' : 'Calculate Logistics Prediction'}
              {!isLoading && <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </span>
          </button>
        </form>
      </div>

    </div>
  );
}
