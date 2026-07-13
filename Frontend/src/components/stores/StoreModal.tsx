import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Store as StoreIcon, Loader2 } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import type { Store } from '../../types/firestore.types';
import { useAuth } from '../../context/AuthContext';
import { serverTimestamp } from 'firebase/firestore';
import { cn } from '../../utils/cn';

const storeSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  category: z.string().min(2, 'Please select or enter a category'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
});

type StoreFormValues = z.infer<typeof storeSchema>;

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  storeToEdit?: Store | null;
}

const CATEGORIES = [
  'Retail',
  'Grocery',
  'Electronics',
  'Fashion & Apparel',
  'Home & Garden',
  'Health & Beauty',
  'Other'
];

export function StoreModal({ isOpen, onClose, onSuccess, storeToEdit }: StoreModalProps) {
  const { currentUser } = useAuth();
  const { add, update, isLoading } = useFirestore<Store>('stores');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      storeName: '',
      category: '',
      location: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (storeToEdit) {
        reset({
          storeName: storeToEdit.storeName,
          category: storeToEdit.category,
          location: storeToEdit.location,
        });
      } else {
        reset({ storeName: '', category: '', location: '' });
      }
    }
  }, [isOpen, storeToEdit, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: StoreFormValues) => {
    if (!currentUser) return;

    try {
      if (storeToEdit && storeToEdit.id) {
        await update(storeToEdit.id, {
          storeName: data.storeName,
          category: data.category,
          location: data.location,
        });
      } else {
        await add({
          ownerId: currentUser.uid,
          storeName: data.storeName,
          category: data.category,
          location: data.location,
          createdAt: serverTimestamp(),
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save store', error);
      // Let the hook handle the error logging, but we can also show a toast here in the future
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <StoreIcon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {storeToEdit ? 'Edit Store' : 'Add New Store'}
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
            <label className="text-sm font-semibold text-slate-700" htmlFor="storeName">
              Store Name
            </label>
            <input
              id="storeName"
              type="text"
              placeholder="e.g. Downtown Supermarket"
              className={cn(
                "block w-full rounded-xl border bg-surface-50 p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                errors.storeName ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
              )}
              {...register('storeName')}
            />
            {errors.storeName && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.storeName.message}</p>
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

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g. 123 Market St, NY"
              className={cn(
                "block w-full rounded-xl border bg-surface-50 p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                errors.location ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
              )}
              {...register('location')}
            />
            {errors.location && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.location.message}</p>
            )}
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
              {storeToEdit ? 'Save Changes' : 'Create Store'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
