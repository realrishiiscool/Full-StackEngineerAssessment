import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, ClipboardList, Loader2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import workOrdersApi from '../../api/workOrders';

const WO_STATUSES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const MAINTENANCE_TYPES = ['INSPECTION', 'PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'];

const PAGE_SIZE = 10;

export default function WorkOrderList() {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '', priority: '', maintenanceType: '',
    dateFrom: '', dateTo: '', search: '',
  });

  useEffect(() => { fetchWorkOrders(); }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const res = await workOrdersApi.getAll();
      setWorkOrders(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = workOrders.filter((wo) => {
    if (filters.status && wo.status !== filters.status) return false;
    if (filters.priority && wo.priority !== filters.priority) return false;
    if (filters.maintenanceType && wo.maintenanceType !== filters.maintenanceType) return false;
    if (filters.dateFrom) {
      const scheduled = new Date(wo.scheduledDate);
      if (scheduled < new Date(filters.dateFrom)) return false;
    }
    if (filters.dateTo) {
      const scheduled = new Date(wo.scheduledDate);
      if (scheduled > new Date(filters.dateTo)) return false;
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const match =
        wo.workOrderNumber?.toLowerCase().includes(s) ||
        wo.description?.toLowerCase().includes(s) ||
        wo.Asset?.assetId?.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [filters.status, filters.priority, filters.maintenanceType, filters.dateFrom, filters.dateTo, filters.search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Orders</h2>
          <p className="text-gray-500 mt-1">Track and manage maintenance work orders</p>
        </div>
        <Link to="/work-orders/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Create Work Order
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
            <option value="">All Statuses</option>
            {WO_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filters.maintenanceType} onChange={(e) => setFilters((f) => ({ ...f, maintenanceType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
            <option value="">All Types</option>
            {MAINTENANCE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search WO number, description, asset..." value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ClipboardList className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-lg font-medium">No work orders found</p>
            <p className="text-sm mt-1">{workOrders.length === 0 ? 'Create your first work order to get started' : 'Try adjusting your filters'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">WO Number</th>
                    <th className="px-6 py-3">Asset</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Technician</th>
                    <th className="px-6 py-3">Scheduled</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((wo) => (
                    <tr key={wo.id} onClick={() => navigate(`/work-orders/${wo.id}`)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-indigo-600">{wo.workOrderNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{wo.Asset?.assetId || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{wo.maintenanceType?.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4"><StatusBadge value={wo.priority} type="priority" /></td>
                      <td className="px-6 py-4 text-sm text-gray-600">{wo.Technician?.name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleDateString() : '—'}</td>
                      <td className="px-6 py-4"><StatusBadge value={wo.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 border-t border-gray-100">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
