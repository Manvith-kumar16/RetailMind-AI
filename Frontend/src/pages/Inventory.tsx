import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, AlertTriangle, ArrowUpDown, Loader2, Search, Store as StoreIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { useRealtimeCollection } from '../hooks/useRealtimeCollection';
import type { Store, Product, Inventory as InventoryItem } from '../types/firestore.types';
import { where } from 'firebase/firestore';
import { UpdateStockModal } from '../components/inventory/UpdateStockModal';
import { cn } from '../utils/cn';

export function Inventory() {
  const navigate = useNavigate();
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

  const { data: products, isLoading: productsLoading } = useRealtimeCollection<Product>(
    'products',
    productConstraints
  );

  // Fetch all real-time inventory (client-side join required per schema)
  const { data: allInventory, isLoading: inventoryLoading } = useRealtimeCollection<InventoryItem>('inventory');

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<(InventoryItem & { id: string }) | null>(null);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Join products and inventory
  const joinedData = useMemo(() => {
    return products.map(product => {
      const invItem = allInventory.find(inv => inv.productId === product.id);
      return {
        product,
        inventory: invItem,
        isLowStock: invItem ? invItem.currentStock <= invItem.reorderLevel : false
      };
    });
  }, [products, allInventory]);

  // Filter based on search and low stock toggle
  const filteredData = useMemo(() => {
    return joinedData.filter(item => {
      const matchesSearch = item.product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLowStock = filterLowStock ? item.isLowStock : true;
      return matchesSearch && matchesLowStock;
    });
  }, [joinedData, searchQuery, filterLowStock]);

  const handleUpdateStock = (inventoryItem: InventoryItem & { id: string }, productName: string) => {
    setSelectedInventoryItem(inventoryItem);
    setSelectedProductName(productName);
    setIsModalOpen(true);
  };

  const isLoading = storesLoading || productsLoading || inventoryLoading;

  if (storesLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
          <StoreIcon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Stores Found</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          You need to create a store before managing inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Store Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Store:</span>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="rounded-lg border-0 bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600"
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.storeName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats/Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 flex items-center gap-4 border-l-4 border-blue-500">
           <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
             <Box className="h-6 w-6" />
           </div>
           <div>
             <p className="text-sm font-semibold text-slate-500">Total Items Tracked</p>
             <p className="text-2xl font-bold text-slate-900">{joinedData.length}</p>
           </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 flex items-center gap-4 border-l-4 border-red-500">
           <div className="bg-red-50 p-3 rounded-xl text-red-600">
             <AlertTriangle className="h-6 w-6" />
           </div>
           <div>
             <p className="text-sm font-semibold text-slate-500">Low Stock Alerts</p>
             <p className="text-2xl font-bold text-red-600">
               {joinedData.filter(d => d.isLowStock).length}
             </p>
           </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search inventory by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4 cursor-pointer"
            />
            Show Low Stock Only
          </label>
        </div>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filteredData.length === 0 ? (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 text-center">
          <Box className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No inventory found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or adding products first.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900">Product</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900 text-right">Current Stock</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900 text-right">Reorder Level</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900 text-center">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredData.map(({ product, inventory, isLowStock }) => (
                  <tr key={product.id} className={cn("transition-colors hover:bg-slate-50/50", isLowStock && "bg-red-50/30 hover:bg-red-50/50")}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.category}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-bold text-slate-900">
                      {inventory ? inventory.currentStock : product.stock}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-500">
                      {inventory ? inventory.reorderLevel : 'Not set'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          <AlertTriangle className="h-3.5 w-3.5" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          if (inventory) {
                            handleUpdateStock(inventory as any, product.name);
                          } else {
                            alert("No inventory record initialized for this product. Edit the product in Products tab to initialize it.");
                          }
                        }}
                        disabled={!inventory}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UpdateStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inventoryItem={selectedInventoryItem}
        productName={selectedProductName}
      />
    </div>
  );
}
