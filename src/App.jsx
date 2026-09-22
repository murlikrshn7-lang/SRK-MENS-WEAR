import { Routes, Route } from 'react-router-dom';
import CustomerStore from './pages/CustomerStore';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CustomerStore />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}