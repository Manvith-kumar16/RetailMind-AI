import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z.string().min(3, 'SKU is required'),
  category: z.string().min(2, 'Category is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  alertThreshold: z.coerce.number().min(0, 'Threshold cannot be negative'),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductFormValues) => void;
  initialData?: ProductFormValues | null;
}

export function ProductModal({ isOpen, onClose, onSave, initialData }: ProductModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      price: 0,
      stock: 0,
      alertThreshold: 0,
    },
  });

  // Populate form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        // Reset to clean state for "Add"
        reset({
          name: '',
          sku: '',
          category: '',
          price: 0,
          stock: 0,
          alertThreshold: 0,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: ProductFormValues) => {
    // If editing, preserve the ID
    if (isEditing && initialData?.id) {
      onSave({ ...data, id: initialData.id });
    } else {
      onSave(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            
            {/* Name Field - Full width */}
            <div className="col-span-full space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Product Name</label>
              <input
                type="text"
                className={cn(
                  "block w-full rounded-lg border bg-slate-50 p-2.5 text-sm transition-colors",
                  "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                  errors.name ? "border-red-300 focus:border-red-500 bg-red-50/50" : "border-slate-200"
                )}
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                {...register('name')}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-xs font-medium text-red-500 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">SKU</label>
              <input
                type="text"
                className={cn(
                  "block w-full rounded-lg border bg-slate-50 p-2.5 text-sm transition-colors uppercase",
                  "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                  errors.sku ? "border-red-300 focus:border-red-500 bg-red-50/50" : "border-slate-200"
                )}
                placeholder="PROD-001"
                {...register('sku')}
              />
              {errors.sku && <p className="text-xs font-medium text-red-500 mt-1">{errors.sku.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <input
                type="text"
                className={cn(
                  "block w-full rounded-lg border bg-slate-50 p-2.5 text-sm transition-colors",
                  "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                  errors.category ? "border-red-300 focus:border-red-500 bg-red-50/50" : "border-slate-200"
                )}
                placeholder="Electronics"
                {...register('category')}
              />
              {errors.category && <p className="text-xs font-medium text-red-500 mt-1">{errors.category.message}</p>}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Price ($)</label>
              <input
                type="number"
                step="0.01"
                className={cn(
                  "block w-full rounded-lg border bg-slate-50 p-2.5 text-sm transition-colors",
                  "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                  errors.price ? "border-red-300 focus:border-red-500 bg-red-50/50" : "border-slate-200"
                )}
                placeholder="99.99"
                {...register('price')}
              />
              {errors.price && <p className="text-xs font-medium text-red-500 mt-1">{errors.price.message}</p>}
            </div>

            {/* Stock Level */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Current Stock</label>
              <input
                type="number"
                className={cn(
                  "block w-full rounded-lg border bg-slate-50 p-2.5 text-sm transition-colors",
                  "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                  errors.stock ? "border-red-300 focus:border-red-500 bg-red-50/50" : "border-slate-200"
                )}
                placeholder="100"
                {...register('stock')}
              />
              {errors.stock && <p className="text-xs font-medium text-red-500 mt-1">{errors.stock.message}</p>}
            </div>

            {/* Alert Threshold - Full width across mobile, spanning nicely */}
            <div className="col-span-full sm:col-span-2 lg:col-span-2 space-y-1.5 border-t border-slate-100 pt-4 mt-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Low Stock Alert Threshold
                <span className="group relative cursor-help">
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                  <span className="absolute bottom-full mb-2 hidden w-48 rounded bg-slate-800 p-2 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                    When stock falls below this number, the item triggers a warning.
                  </span>
                </span>
              </label>
              <input
                type="number"
                className={cn(
                  "block w-full sm:w-1/2 rounded-lg border bg-slate-50 p-2.5 text-sm transition-colors",
                  "focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10",
                  errors.alertThreshold ? "border-red-300 focus:border-red-500 bg-red-50/50" : "border-slate-200"
                )}
                placeholder="20"
                {...register('alertThreshold')}
              />
              {errors.alertThreshold && <p className="text-xs font-medium text-red-500 mt-1">{errors.alertThreshold.message}</p>}
            </div>
            
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-600/20 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-600/20 active:bg-primary-800 transition-all hover:-translate-y-0.5"
            >
              <Save className="h-4 w-4" />
              {isEditing ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
