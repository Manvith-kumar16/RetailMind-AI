import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Box, Loader2 } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import type { Inventory, Product } from '../../types/firestore.types';
import { serverTimestamp } from 'firebase/firestore';
import { cn } from '../../utils/cn';

const stockSchema = z.object({
  currentStock: z.number().int('Stock must be a whole number').min(0, 'Stock cannot be negative'),
  reorderLevel: z.number().int('Reorder level must be a whole number').min(0, 'Reorder level cannot be negative'),
});

type StockFormValues = z.infer<typeof stockSchema>;

interface UpdateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: (Inventory & { id: string }) | null;
  productName: string;
}

export function UpdateStockModal({ isOpen, onClose, inventoryItem, productName }: UpdateStockModalProps) {
  const { update: updateInventory, isLoading: inventoryLoading } = useFirestore<Inventory>('inventory');
  const { update: updateProduct, isLoading: productLoading } = useFirestore<Product>('products');

  const isLoading = inventoryLoading || productLoading;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      currentStock: 0,
      reorderLevel: 5,
    }
  });

  useEffect(() => {
    if (isOpen && inventoryItem) {
      reset({
        currentStock: inventoryItem.currentStock,
        reorderLevel: inventoryItem.reorderLevel,
      });
    }
  }, [isOpen, inventoryItem, reset]);

  if (!isOpen || !inventoryItem) return null;

  const onSubmit = async (data: StockFormValues) => {
    try {
      // 1. Update the inventory record
      await updateInventory(inventoryItem.id, {
        currentStock: data.currentStock,
        reorderLevel: data.reorderLevel,
        updatedAt: serverTimestamp()
      });

      // 2. Sync with the product record
      await updateProduct(inventoryItem.productId, {
        stock: data.currentStock
      });

      onClose();
    } catch (error) {
      console.error('Failed to update stock', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Update Stock</h3>
              <p className="text-sm font-medium text-slate-500">{productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="currentStock">
                Current Stock
              </label>
              <input
                id="currentStock"
                type="number"
                className={cn(
                  "block w-full rounded-xl border bg-surface-50 p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                  "focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10",
                  errors.currentStock ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
                )}
                {...register('currentStock', { valueAsNumber: true })}
              />
              {errors.currentStock && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.currentStock.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="reorderLevel">
                Reorder Level
              </label>
              <input
                id="reorderLevel"
                type="number"
                className={cn(
                  "block w-full rounded-xl border bg-surface-50 p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                  "focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10",
                  errors.reorderLevel ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
                )}
                {...register('reorderLevel', { valueAsNumber: true })}
              />
              {errors.reorderLevel && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.reorderLevel.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 active:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
