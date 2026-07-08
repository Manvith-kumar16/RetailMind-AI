import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Filter, Edit2, Trash2, Loader2, AlertCircle, Store as StoreIcon, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { useRealtimeCollection } from '../hooks/useRealtimeCollection';
import type { Store, Product } from '../types/firestore.types';
import { where } from 'firebase/firestore';
import { ProductModal } from '../components/products/ProductModal';
import { cn } from '../utils/cn';
export function Products() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Fetch stores (not real-time, just once on load)
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

  // Real-time fetching of products based on selected store
  const productConstraints = useMemo(() => {
    return selectedStoreId ? [where('storeId', '==', selectedStoreId)] : [];
  }, [selectedStoreId]);

  const { data: products, isLoading: productsLoading, error: productsError } = useRealtimeCollection<Product>(
    'products',
    productConstraints
  );

  const { remove, isLoading: isRemoving } = useFirestore<Product>('products');

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const categories = useMemo(() => {
    const uniqueCats = new Set(products.map(p => p.category));
    return Array.from(uniqueCats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleAddProduct = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await remove(productId);
    }
  };

  if (storesLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-4">
          <StoreIcon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Stores Found</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          You need to create a store before you can add products.
        </p>
        <button
          onClick={() => navigate('/stores')}
          className="mt-6 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all"
        >
          Go to Stores
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Store Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Store:</span>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="rounded-lg border-0 bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600"
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.storeName}</option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedStoreId && (
          <button
            onClick={handleAddProduct}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 active:bg-primary-800"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        )}
      </div>

      {productsError && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{productsError}</p>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-10 pr-8 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary-600 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table/Grid */}
      {productsLoading ? (
        <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 text-center">
          <Package className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No products found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or adding a new product.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900">Product</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900">Category</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900 text-right">Price</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900 text-right">Stock</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <Package className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-slate-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        {product.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span className={cn(
                        "font-medium",
                        product.stock === 0 ? "text-red-600" : product.stock < 10 ? "text-amber-600" : "text-green-600"
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => product.id && handleDeleteProduct(product.id)}
                          disabled={isRemoving}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedStoreId && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          storeId={selectedStoreId}
          productToEdit={productToEdit}
        />
      )}
    </div>
  );
}
