import { useParams, useNavigate } from 'react';
import { ArrowLeft, Package, Tag, Loader2, AlertCircle, TrendingUp, DollarSign, Archive, Calendar } from 'lucide-react';
import { useRealtimeDocument } from '../hooks/useRealtimeCollection';
import type { Product } from '../types/firestore.types';
import { cn } from '../utils/cn';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading, error } = useRealtimeDocument<Product>('products', id);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/50 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
        <h3 className="text-lg font-bold text-red-900">Product Not Found</h3>
        <p className="mt-2 text-sm text-red-600 max-w-sm">
          {error || "The product you're looking for doesn't exist or has been deleted."}
        </p>
        <button
          onClick={() => navigate('/products')}
          className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Format the date if it's a Firestore Timestamp
  const createdAtDate = product.createdAt ? (product.createdAt as any).toDate() : new Date();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="rounded-xl p-2.5 text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm ring-1 ring-transparent hover:ring-slate-200 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{product.name}</h1>
            <span className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              product.stock === 0 ? "bg-red-100 text-red-700" : product.stock < 10 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
            )}>
              {product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="font-mono text-xs">{product.id}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Stats */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-3 text-slate-500 mb-4">
                <div className="rounded-lg bg-green-50 p-2 text-green-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold">Current Price</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">${product.price.toFixed(2)}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-3 text-slate-500 mb-4">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Archive className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold">Stock Level</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{product.stock} <span className="text-lg font-medium text-slate-400">units</span></p>
            </div>
          </div>

          {/* Additional details card could go here */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
             <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-500" /> Performance Insights
             </h3>
             <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                Performance charts will appear here as data accumulates.
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary-500" /> Product Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Category</span>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <Tag className="h-4 w-4 text-slate-400" />
                  {product.category}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Added On</span>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {createdAtDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div>
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Store Reference</span>
                 <div className="text-sm font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 break-all">
                    {product.storeId}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
