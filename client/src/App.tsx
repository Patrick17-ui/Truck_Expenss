import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HashRouter as BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/app-layout';
import { Toaster } from './components/ui/sonner';
import { ClientsPage } from './pages/clients';
import { DashboardPage } from './pages/dashboard';
import { DriversTripsPage } from './pages/drivers-trips';
import { ExpensesPage } from './pages/expenses';
import { LoginPage } from './pages/login';
import { TripsPage } from './pages/trips';
import { UsersPage } from './pages/users';
import { VehiclesPage } from './pages/vehicles';

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Protected routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path='/drivers-trips' element={<DriversTripsPage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/transactions" element={<div>Transactions Page</div>} />
            <Route path="/invoices" element={<div>Invoices Page</div>} />
            <Route path="/settings" element={<div>Settings Page</div>} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
