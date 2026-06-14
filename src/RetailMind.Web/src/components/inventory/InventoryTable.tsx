import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit2, Trash2, Box } from 'lucide-react';
import type { ProductFormValues } from './ProductModal';
import { cn } from '../../utils/cn';

interface InventoryTableProps {
  data: ProductFormValues[];
  searchTerm: string;
  onEdit: (product: ProductFormValues) => void;
  onDelete: (id: string) => void;
}

type SortField = keyof ProductFormValues;
type SortDirection = 'asc' | 'desc' | null;

export function InventoryTable({ data, searchTerm, onEdit, onDelete }: InventoryTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle Sort Click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render Sort Icon Helper
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-300" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary-600" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary-600" />;
  };

  // Compute filtering and sorting
  const filteredAndSortedData = useMemo(() => {
    // 1. Filter
    let processed = data;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      processed = processed.filter(
        (item) => 
          item.name.toLowerCase().includes(lowerSearch) ||
          item.sku.toLowerCase().includes(lowerSearch) ||
          item.category.toLowerCase().includes(lowerSearch)
      );
    }

    // 2. Sort
    if (sortField && sortDirection) {
      processed = [...processed].sort((a, b) => {
        let aValue = a[sortField] as string | number;
        let bValue = b[sortField] as string | number;

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processed;
  }, [data, searchTerm, sortField, sortDirection]);

  // Render Stock Badge Helper
  const renderStockBadge = (stock: number, threshold: number) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
          Out of Stock
        </span>
      );
    }
    if (stock <= threshold) {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
        In Stock
      </span>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <Box className="h-10 w-10 text-slate-300" />
        <h3 className="mt-4 text-sm font-medium text-slate-900">No products</h3>
        <p className="mt-1 text-sm text-slate-500">Get started by adding a new product to your inventory.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th 
                className="cursor-pointer px-6 py-4 font-semibold text-slate-900 transition-colors hover:bg-slate-100/50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">Product Name {renderSortIcon('name')}</div>
              </th>
              <th 
                className="cursor-pointer px-6 py-4 font-semibold text-slate-900 transition-colors hover:bg-slate-100/50"
                onClick={() => handleSort('sku')}
              >
                <div className="flex items-center">SKU {renderSortIcon('sku')}</div>
              </th>
              <th 
                className="cursor-pointer px-6 py-4 font-semibold text-slate-900 transition-colors hover:bg-slate-100/50"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">Category {renderSortIcon('category')}</div>
              </th>
              <th 
                className="cursor-pointer px-6 py-4 font-semibold text-slate-900 transition-colors hover:bg-slate-100/50"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center">Price {renderSortIcon('price')}</div>
              </th>
              <th 
                className="cursor-pointer px-6 py-4 font-semibold text-slate-900 transition-colors hover:bg-slate-100/50"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center">Stock {renderSortIcon('stock')}</div>
              </th>
              <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
              <th className="px-6 py-4 text-right font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredAndSortedData.map((item) => (
              <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 text-slate-900 font-medium">{item.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-500 font-mono text-xs">{item.sku}</td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-500">{item.category}</td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-700">${Number(item.price).toFixed(2)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                  <div className="flex items-baseline gap-1.5">
                    <span className={cn(
                      "font-semibold",
                      item.stock <= item.alertThreshold ? "text-red-600" : "text-slate-900"
                    )}>
                      {item.stock}
                    </span>
                    <span className="text-xs text-slate-400">/ {item.alertThreshold} min</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {renderStockBadge(Number(item.stock), Number(item.alertThreshold))}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(item)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-primary-600 transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => item.id && onDelete(item.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {/* Empty Search State */}
            {filteredAndSortedData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                  No products matched your search "{searchTerm}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
