import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ShoppingCart, Loader2, DollarSign } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import type { Sale, Product, Inventory } from '../../types/firestore.types';
import { serverTimestamp, where } from 'firebase/firestore';
import { cn } from '../../utils/cn';

const saleSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.number().int('Quantity must be a whole number').min(1, 'Must sell at least 1 item'),
});

type SaleFormValues = z.infer<typeof saleSchema>;

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  products: (Product & { id: string })[];
}

export function RecordSaleModal({ isOpen, onClose, storeId, products }: RecordSaleModalProps) {
  const { add: addSale, isLoading: saleLoading } = useFirestore<Sale>('sales');
  const { update: updateProduct, isLoading: productLoading } = useFirestore<Product>('products');
  const { update: updateInventory, getAll: getInventory, isLoading: inventoryLoading } = useFirestore<Inventory>('inventory');

  const isLoading = saleLoading || productLoading || inventoryLoading;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productId: '',
      quantity: 1,
    }
  });

  const selectedProductId = watch('productId');
  const quantity = watch('quantity');

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId);
  }, [products, selectedProductId]);

  const total = useMemo(() => {
    if (!selectedProduct || !quantity) return 0;
    return selectedProduct.price * quantity;
  }, [selectedProduct, quantity]);

  if (!isOpen) return null;

  const onSubmit = async (data: SaleFormValues) => {
    if (!storeId || !selectedProduct) return;

    if (selectedProduct.stock < data.quantity) {
      alert(`Cannot sell ${data.quantity}. Only ${selectedProduct.stock} left in stock.`);
      return;
    }

    try {
      // 1. Record the Sale
      await addSale({
        storeId,
        productId: data.productId,
        quantity: data.quantity,
        total: total,
        createdAt: serverTimestamp(),
      });

      const newStock = selectedProduct.stock - data.quantity;

      // 2. Update Product stock
      await updateProduct(data.productId, {
        stock: newStock
      });

      // 3. Update Inventory document stock
      const inventoryDocs = await getInventory([where('productId', '==', data.productId)]);
      if (inventoryDocs.length > 0 && inventoryDocs[0].id) {
        await updateInventory(inventoryDocs[0].id, {
          currentStock: newStock,
          updatedAt: serverTimestamp()
        });
      }

      reset({ productId: '', quantity: 1 });
      onClose();
    } catch (error) {
      console.error('Failed to record sale', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Record Sale
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="productId">
              Product
            </label>
            <select
              id="productId"
              className={cn(
                "block w-full rounded-xl border bg-surface-50 p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 appearance-none",
                "focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10",
                errors.productId ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
              )}
              {...register('productId')}
            >
              <option value="" disabled>Select a product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.price.toFixed(2)} ({p.stock} in stock)
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.productId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="quantity">
              Quantity Sold
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              className={cn(
                "block w-full rounded-xl border bg-surface-50 p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                "focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10",
                errors.quantity ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
              )}
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
               <DollarSign className="h-4 w-4" /> Total Amount
            </span>
            <span className="text-xl font-bold text-slate-900">
               ${total.toFixed(2)}
            </span>
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
              disabled={isLoading || !selectedProduct}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-600/20 active:bg-green-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-green-600/20"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Complete Sale
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
