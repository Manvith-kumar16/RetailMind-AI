import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Users, Package, AlertTriangle, ArrowUpRight, ArrowDownRight, CalendarDays, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SalesChart } from '../components/dashboard/SalesChart';
import { DemandForecastChart } from '../components/dashboard/DemandForecastChart';
import { InventoryChart } from '../components/dashboard/InventoryChart';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { useRealtimeCollection } from '../hooks/useRealtimeCollection';
import type { Store, Sale } from '../types/firestore.types';
import { where } from 'firebase/firestore';

export function Dashboard() {
  const { currentUser } = useAuth();
  
  // Fetch user's stores
  const { getAll: getStores, isLoading: storesLoading } = useFirestore<Store>('stores');
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    async function loadStores() {
      if (!currentUser) return;
      const data = await getStores([where('ownerId', '==', currentUser.uid)]);
      setStores(data);
    }
    loadStores();
  }, [currentUser, getStores]);

  const storeIds = useMemo(() => stores.map(s => s.id!), [stores]);

  // Fetch all real-time sales
  const { data: allSales } = useRealtimeCollection<Sale>('sales');

  // Filter sales to only those belonging to the user's stores
  const mySales = useMemo(() => {
    return allSales.filter(sale => storeIds.includes(sale.storeId));
  }, [allSales, storeIds]);

  const { dailySales, monthlySales, totalRevenue, totalOrders } = useMemo(() => {
    let daily = 0;
    let monthly = 0;
    let revenue = 0;
    let orders = mySales.length;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    mySales.forEach(sale => {
      const saleTotal = sale.total || 0;
      revenue += saleTotal;
      
      const saleTime = sale.createdAt ? (sale.createdAt as any).toMillis() : 0;
      if (saleTime >= startOfDay) daily += saleTotal;
      if (saleTime >= startOfMonth) monthly += saleTotal;
    });

    return { dailySales: daily, monthlySales: monthly, totalRevenue: revenue, totalOrders: orders };
  }, [mySales]);

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      title: 'Monthly Sales',
      value: `$${monthlySales.toFixed(2)}`,
      change: '+5.2%',
      trend: 'up',
      icon: CalendarDays,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Daily Sales',
      value: `$${dailySales.toFixed(2)}`,
      change: '-2.4%',
      trend: 'down',
      icon: CalendarIcon,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      change: '+18.1%',
      trend: 'up',
      icon: Package,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Welcome back, here's what's happening with your stores today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export Data</Button>
          <Button>Generate Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {/* Dummy trend data for now */}
                    {stat.change}
                    {stat.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts Area: Top Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Chart (Takes 2/3 of space on lg screens) */}
        <Card className="col-span-1 lg:col-span-2 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-slate-100 bg-white">
            <CardTitle>Sales Trend (Weekly)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 bg-white">
            <SalesChart />
          </CardContent>
        </Card>

        {/* Demand AI Forecast */}
        <Card className="col-span-1 border-emerald-100 shadow-emerald-100/20 shadow-xl overflow-hidden group">
          <CardHeader className="border-b border-emerald-50 bg-emerald-50 bg-opacity-30">
            <div className="flex items-center justify-between">
              <CardTitle>AI Demand Forecast</CardTitle>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 bg-white group-hover:bg-slate-50/50 transition-colors duration-300">
            <DemandForecastChart />
          </CardContent>
        </Card>
      </div>

      {/* Lower Charts Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Inventory Distribution */}
        <Card className="col-span-1 lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Inventory Distribution & Alerts</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <InventoryChart />
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="col-span-1">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Recent Sales Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {mySales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-slate-900">Sale Recorded</p>
                    <p className="text-xs text-slate-500">
                      {sale.quantity} items • ${(sale.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {mySales.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No recent sales</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
