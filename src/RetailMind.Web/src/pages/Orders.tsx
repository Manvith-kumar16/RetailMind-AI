import { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { OrderList } from '../components/orders/OrderList';
import { OrderWizard } from '../components/orders/OrderWizard';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Canceled';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
}

// Mock Data
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-8921',
    customerName: 'Acme Corp',
    customerEmail: 'billing@acmecorp.com',
    shippingAddress: '123 Innovation Way, Tech City, CA 94016',
    date: '2026-03-29',
    status: 'Pending',
    totalAmount: 4500.00,
    items: [
      { id: '1', name: 'Wireless Airbuds Max', quantity: 15, price: 300.00 }
    ]
  },
  {
    id: 'ORD-8894',
    customerName: 'Globex Inc',
    customerEmail: 'procure@globex.com',
    shippingAddress: '789 Business Blvd, Suite 200, NY 10001',
    date: '2026-03-28',
    status: 'Shipped',
    totalAmount: 1250.50,
    items: [
      { id: '2', name: 'Mechanical Keyboard', quantity: 5, price: 129.00 },
      { id: '3', name: 'Ultra HD Monitor', quantity: 1, price: 605.50 }
    ]
  },
  {
    id: 'ORD-8711',
    customerName: 'Stark Industries',
    customerEmail: 'tony@stark.com',
    shippingAddress: '10880 Malibu Point, CA 90265',
    date: '2026-03-25',
    status: 'Delivered',
    totalAmount: 12400.00,
    items: [
      { id: '4', name: 'Server Rack X1', quantity: 2, price: 6200.00 }
    ]
  },
  {
    id: 'ORD-8602',
    customerName: 'Wayne Enterprises',
    customerEmail: 'logistics@wayne.com',
    shippingAddress: '1007 Mountain Drive, Gotham',
    date: '2026-03-24',
    status: 'Canceled',
    totalAmount: 890.00,
    items: [
      { id: '5', name: 'Tactical Flashlight', quantity: 10, price: 89.00 }
    ]
  }
];

export function Orders() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [view, setView] = useState<'list' | 'wizard'>('list');

  const handleCreateOrder = (newOrderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    const newOrder: Order = {
      ...newOrderData,
      id: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    
    setOrders(prev => [newOrder, ...prev]);
    setView('list'); // Return to list view
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Canceled' } : o));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {view === 'list' ? 'Order Management' : 'Create New Order'}
          </h1>
          <p className="text-sm text-slate-500">
            {view === 'list' 
              ? 'Track shipments, handle fulfillment, and process inbound requests.' 
              : 'Complete the steps below to securely place a new purchase order.'}
          </p>
        </div>
        
        {view === 'list' && (
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setView('wizard')} className="bg-primary-600 hover:bg-primary-700 gap-2 shadow-lg shadow-primary-600/20">
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {view === 'list' ? (
          <OrderList orders={orders} onCancelOrder={handleCancelOrder} />
        ) : (
          <OrderWizard onComplete={handleCreateOrder} onCancel={() => setView('list')} />
        )}
      </div>

    </div>
  );
}
