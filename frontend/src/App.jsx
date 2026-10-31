import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/assets/AssetList';
import AssetForm from './pages/assets/AssetForm';
import AssetDetail from './pages/assets/AssetDetail';
import TechnicianList from './pages/technicians/TechnicianList';
import TechnicianForm from './pages/technicians/TechnicianForm';
import WorkOrderList from './pages/work-orders/WorkOrderList';
import WorkOrderForm from './pages/work-orders/WorkOrderForm';
import WorkOrderDetail from './pages/work-orders/WorkOrderDetail';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />

        <Route path="/assets" element={<AssetList />} />
        <Route path="/assets/new" element={<AssetForm />} />
        <Route path="/assets/:id" element={<AssetDetail />} />
        <Route path="/assets/:id/edit" element={<AssetForm />} />

        <Route path="/technicians" element={<TechnicianList />} />
        <Route path="/technicians/new" element={<TechnicianForm />} />
        <Route path="/technicians/:id/edit" element={<TechnicianForm />} />

        <Route path="/work-orders" element={<WorkOrderList />} />
        <Route path="/work-orders/new" element={<WorkOrderForm />} />
        <Route path="/work-orders/:id" element={<WorkOrderDetail />} />
        <Route path="/work-orders/:id/edit" element={<WorkOrderForm />} />
      </Route>
    </Routes>
  );
}
