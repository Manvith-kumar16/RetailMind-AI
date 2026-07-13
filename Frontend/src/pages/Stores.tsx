import { useState, useEffect, useCallback } from 'react';
import { Plus, Store as StoreIcon, MapPin, Tag, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import type { Store } from '../types/firestore.types';
import { where } from 'firebase/firestore';
import { StoreModal } from '../components/stores/StoreModal';

export function Stores() {
  const { currentUser } = useAuth();
  const { getAll, remove, isLoading, error } = useFirestore<Store>('stores');
  
  const [stores, setStores] = useState<Store[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<Store | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  const fetchStores = useCallback(async () => {
    if (!currentUser) return;
    setIsFetching(true);
    const data = await getAll([where('ownerId', '==', currentUser.uid)]);
    setStores(data);
    setIsFetching(false);
  }, [currentUser, getAll]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleAddStore = () => {
    setStoreToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditStore = (store: Store) => {
    setStoreToEdit(store);
    setIsModalOpen(true);
  };

  const handleDeleteStore = async (storeId: string) => {
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      await remove(storeId);
      fetchStores(); // Refresh list after deletion
    }
  };

  const handleModalSuccess = () => {
    fetchStores(); // Refresh list after add/update
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stores</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your retail locations and categories.</p>
        </div>
        <button
          onClick={handleAddStore}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 active:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-600/20"
        >
          <Plus className="h-5 w-5" />
          Add Store
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Content */}
      {isFetching ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="mt-4 text-sm font-medium text-slate-500">Loading your stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-4">
            <StoreIcon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No stores found</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            You haven't created any stores yet. Add your first store to start managing your retail operations.
          </p>
          <button
            onClick={handleAddStore}
            className="mt-6 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary-600 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors"
          >
            Create Store
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:ring-slate-200 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <StoreIcon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleEditStore(store)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-colors focus:opacity-100 focus:outline-none"
                      title="Edit Store"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => store.id && handleDeleteStore(store.id)}
                      disabled={isLoading}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors focus:opacity-100 focus:outline-none disabled:opacity-50"
                      title="Delete Store"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="text-lg font-bold text-slate-900 truncate" title={store.storeName}>
                    {store.storeName}
                  </h3>
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{store.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{store.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Store Modal */}
      <StoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        storeToEdit={storeToEdit}
      />
    </div>
  );
}
