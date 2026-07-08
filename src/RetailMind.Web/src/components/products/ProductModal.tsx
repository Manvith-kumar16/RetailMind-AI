import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Package, Loader2 } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import type { Product, Inventory } from '../../types/firestore.types';
import { serverTimestamp, where } from 'firebase/firestore';
import { cn } from '../../utils/cn';

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(2, 'Please specify a category'),
  price: z.number().min(0, 'Price cannot be negative'),
  stock: z.number().int('Stock must be a whole number').min(0, 'Stock cannot be negative'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  productToEdit?: Product | null;
}

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food & Beverage',
  'Home & Garden',
  'Health & Beauty',
  'Toys & Games',
  'Automotive',
  'Other'
];

export function ProductModal({ isOpen, onClose, storeId, productToEdit }: ProductModalProps) {
  const { add: addProduct, update: updateProduct, isLoading: productLoading } = useFirestore<Product>('products');
  const { add: addInventory, update: updateInventory, getAll: getInventory, isLoading: inventoryLoading } = useFirestore<Inventory>('inventory');

  const isLoading = productLoading || inventoryLoading;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      stock: 0,
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        reset({
          name: productToEdit.name,
          category: productToEdit.category,
          price: productToEdit.price,
          stock: productToEdit.stock,
        });
      } else {
        reset({ name: '', category: '', price: 0, stock: 0 });
      }
    }
  }, [isOpen, productToEdit, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: ProductFormValues) => {
    if (!storeId) {
      console.error("No storeId provided to product modal");
      return;
    }

    try {
      if (productToEdit && productToEdit.id) {
        await updateProduct(productToEdit.id, {
          name: data.name,
          category: data.category,
          price: data.price,
          stock: data.stock,
        });

        // Sync stock to inventory
        const existingInventory = await getInventory([where('productId', '==', productToEdit.id)]);
        if (existingInventory.length > 0 && existingInventory[0].id) {
          await updateInventory(existingInventory[0].id, {
            currentStock: data.stock,
            updatedAt: serverTimestamp()
          });
        }

      } else {
        const newProductId = await addProduct({
          storeId: storeId,
          name: data.name,
          category: data.category,
          price: data.price,
          stock: data.stock,
          createdAt: serverTimestamp(),
        });

        if (newProductId) {
          await addInventory({
            productId: newProductId,
            currentStock: data.stock,
            reorderLevel: 5, // default reorder level
            updatedAt: serverTimestamp()
          });
        }
      }
      onClose();
    } catch (error) {
      console.error('Failed to save product or sync inventory', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {productToEdit ? 'Edit Product' : 'Add New Product'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="name">
              Product Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Wireless Headphones"
              className={cn(
                "block w-full rounded-xl border bg-surface-50 p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
              )}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className={cn(
                "block w-full rounded-xl border bg-surface-50 p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 appearance-none",
                "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                errors.category ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
              )}
              {...register('category')}
            >
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="price">
                Price ($)
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={cn(
                  "block w-full rounded-xl border bg-surface-50 p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                  "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                  errors.price ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
                )}
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="stock">
                Initial Stock
              </label>
              <input
                id="stock"
                type="number"
                placeholder="0"
                className={cn(
                  "block w-full rounded-xl border bg-surface-50 p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                  "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                  errors.stock ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
                )}
                {...register('stock', { valueAsNumber: true })}
              />
              {errors.stock && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.stock.message}</p>
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
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-600/20 active:bg-primary-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
