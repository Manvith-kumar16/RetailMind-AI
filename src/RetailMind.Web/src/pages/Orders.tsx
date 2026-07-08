import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Plus, Loader2, Store as StoreIcon, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { useRealtimeCollection } from '../hooks/useRealtimeCollection';
import type { Store, Product, Sale } from '../types/firestore.types';
import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { RecordSaleModal } from '../components/sales/RecordSaleModal';
import { cn } from '../utils/cn';

export function Orders() {
  const { currentUser } = useAuth();
  
  // Fetch stores
  const { getAll: getStores, isLoading: storesLoading } = useFirestore<Store>('stores');
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  useEffect(() => {
    async function loadStores() {
      if (!currentUser) return;
      const data = await getStores([where('ownerId', '==', currentUser.uid)]);
      setStores(data);
      if (data.length > 0) {
        setSelectedStoreId(data[0].id!);
      }
    }
    loadStores();
  }, [currentUser, getStores]);

  // Fetch real-time products for the selected store
  const productConstraints = useMemo(() => {
    return selectedStoreId ? [where('storeId', '==', selectedStoreId)] : [];
  }, [selectedStoreId]);
  const { data: products, isLoading: productsLoading } = useRealtimeCollection<Product>('products', productConstraints);

  // Fetch real-time sales for the selected store
  const salesConstraints = useMemo(() => {
    const constraints: QueryConstraint[] = [];
    if (selectedStoreId) {
      constraints.push(where('storeId', '==', selectedStoreId));
      // NOTE: Filtering and sorting in Firestore requires an index if combining where() and orderBy().
      // To avoid forcing the user to create an index immediately, we'll sort client-side.
    }
    return constraints;
  }, [selectedStoreId]);
  
  const { data: sales, isLoading: salesLoading } = useRealtimeCollection<Sale>('sales', salesConstraints);

  // Sort sales client-side (newest first)
  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => {
      const timeA = a.createdAt ? (a.createdAt as any).toMillis() : 0;
      const timeB = b.createdAt ? (b.createdAt as any).toMillis() : 0;
      return timeB - timeA;
    });
  }, [sales]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const isLoading = storesLoading || productsLoading || salesLoading;

  if (storesLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600 mb-4">
          <StoreIcon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Stores Found</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          You need to create a store and add products before recording sales.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Store Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales History</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Store:</span>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="rounded-lg border-0 bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-green-600"
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.storeName}</option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedStoreId && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 active:bg-green-800"
          >
            <Plus className="h-5 w-5" />
            Record Sale
          </button>
        )}
      </div>

      {/* Sales Table */}
      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      ) : sortedSales.length === 0 ? (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 text-center">
          <ShoppingCart className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No sales recorded yet</h3>
          <p className="text-sm text-slate-500 mt-1">Click the button above to record your first sale.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900">Date</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900">Product</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900 text-right">Quantity</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedSales.map((sale) => {
                  const date = sale.createdAt ? (sale.createdAt as any).toDate() : new Date();
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {date.toLocaleString()}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                        {getProductName(sale.productId)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-600">
                        {sale.quantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-bold text-slate-900">
                        ${sale.total.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedStoreId && (
        <RecordSaleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          storeId={selectedStoreId}
          products={products}
        />
      )}
    </div>
  );
}
