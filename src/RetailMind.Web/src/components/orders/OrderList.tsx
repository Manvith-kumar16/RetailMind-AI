import { Eye, XCircle, Search, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import type { Order, OrderStatus } from '../../pages/Orders';

interface OrderListProps {
  orders: Order[];
  onCancelOrder: (id: string) => void;
}

export function OrderList({ orders, onCancelOrder }: OrderListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const renderBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">{status}</span>;
      case 'Processing':
        return <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">{status}</span>;
      case 'Shipped':
        return <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">{status}</span>;
      case 'Delivered':
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">{status}</span>;
      case 'Canceled':
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">{status}</span>;
    }
  };

  const filteredOrders = orders.filter(
    o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
         o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
            placeholder="Search by Order ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Layer */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {filteredOrders.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <ClipboardList className="h-10 w-10 text-slate-300" />
            <h3 className="mt-4 text-sm font-medium text-slate-900">No orders found</h3>
            <p className="mt-1 text-sm text-slate-500">Your search did not match any historical orders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-900">Order ID</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Date</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Customer</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Total</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">{order.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">{order.date}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{order.customerName}</span>
                        <span className="text-xs text-slate-500">{order.customerEmail}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-700 font-medium">
                      ${Number(order.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {renderBadge(order.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-primary-600 transition-colors" title="View Order Details">
                          <Eye className="h-4 w-4" />
                        </button>
                        {order.status !== 'Canceled' && order.status !== 'Delivered' && (
                          <button 
                            onClick={() => onCancelOrder(order.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" 
                            title="Cancel Order"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
