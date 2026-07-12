import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { OnboardingFlow } from './pages/onboarding/OnboardingFlow';

import { Inventory } from './pages/Inventory';
import { Orders } from './pages/Orders';
import { Insights } from './pages/Insights';
import { Employees } from './pages/Employees';

import { Stores } from './pages/Stores';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';

// Placeholder components for routing
const Customers = () => <div className="p-6"><h1 className="text-2xl font-bold">Customer CRM</h1></div>;
const Settings = () => <div className="p-6"><h1 className="text-2xl font-bold">System Settings</h1></div>;
const NotFound = () => <div className="flex h-full items-center justify-center"><h1 className="text-2xl font-bold text-slate-500">404 - Page Not Found</h1></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="stores" element={<Stores />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetails />} />
              <Route path="orders" element={<Orders />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="insights" element={<Insights />} />
              <Route path="employees" element={<Employees />} />
              <Route path="customers" element={<Customers />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
