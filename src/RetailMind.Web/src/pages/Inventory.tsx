import { useState } from 'react';
import { Plus, Search, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { ProductModal } from '../components/inventory/ProductModal';
import type { ProductFormValues } from '../components/inventory/ProductModal';

// Dummy initial data to simulate a database for the UI preview
const INITIAL_INVENTORY: ProductFormValues[] = [
  { id: '1', name: 'Wireless Airbuds Max', sku: 'AUD-001', category: 'Electronics', price: 299.99, stock: 145, alertThreshold: 50 },
  { id: '2', name: 'Ergonomic Office Chair', sku: 'FUR-042', category: 'Furniture', price: 199.50, stock: 12, alertThreshold: 20 },
  { id: '3', name: 'Mechanical Keyboard (Red Switches)', sku: 'PER-019', category: 'Electronics', price: 129.00, stock: 0, alertThreshold: 15 },
  { id: '4', name: 'Organic Cotton T-Shirt', sku: 'APP-104', category: 'Apparel', price: 24.99, stock: 450, alertThreshold: 100 },
  { id: '5', name: 'Stainless Steel Water Bottle', sku: 'ACC-007', category: 'Accessories', price: 34.00, stock: 85, alertThreshold: 50 },
  { id: '6', name: '4K Ultra HD Monitor', sku: 'MON-204', category: 'Electronics', price: 599.99, stock: 5, alertThreshold: 10 },
];

export function Inventory() {
  const [data, setData] = useState<ProductFormValues[]>(INITIAL_INVENTORY);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductFormValues | null>(null);

  // Handlers
  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: ProductFormValues) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (formData: ProductFormValues) => {
    if (formData.id) {
      // Edit existing
      setData(prev => prev.map(p => p.id === formData.id ? { ...formData } : p));
    } else {
      // Add new
      const newProduct = { ...formData, id: crypto.randomUUID() };
      setData(prev => [...prev, newProduct]);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setData(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Management</h1>
          <p className="text-sm text-slate-500">View, update, and track your global product catalog across all warehouses.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={handleOpenAdd} className="bg-primary-600 hover:bg-primary-700 gap-2 shadow-lg shadow-primary-600/20">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Toolbar Layer */}
      <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
            placeholder="Search by product name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="text-sm font-medium text-slate-500">
          Total Items: <span className="text-slate-900">{data.length}</span>
        </div>
      </div>

      {/* Main Table Layer */}
      <div className="mt-4">
        <InventoryTable 
          data={data} 
          searchTerm={searchTerm}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteProduct}
        />
      </div>

      {/* Modal Injection */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={productToEdit}
        onSave={handleSaveProduct}
      />

    </div>
  );
}
