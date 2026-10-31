import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Users,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import assetsApi from '../api/assets';
import techniciansApi from '../api/technicians';
import workOrdersApi from '../api/workOrders';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    activeTechnicians: 0,
    openWorkOrders: 0,
    completedThisMonth: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [statusDist, setStatusDist] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [assetsRes, techsRes, ordersRes] = await Promise.all([
        assetsApi.getAll(),
        techniciansApi.getAll(),
        workOrdersApi.getAll(),
      ]);

      const assets = assetsRes.data.data || assetsRes.data || [];
      const technicians = techsRes.data.data || techsRes.data || [];
      const workOrders = ordersRes.data.data || ordersRes.data || [];

      const activeTechs = technicians.filter(
        (t) => t.status === 'AVAILABLE' || t.status === 'BUSY'
      ).length;
      const openWOs = workOrders.filter((w) => w.status === 'OPEN').length;

      const now = new Date();
      const thisMonth = workOrders.filter((w) => {
        if (w.status !== 'COMPLETED' || !w.completedDate) return false;
        const d = new Date(`${String(w.completedDate).slice(0, 10)}T00:00:00`);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      setStats({
        totalAssets: assets.length,
        activeTechnicians: activeTechs,
        openWorkOrders: openWOs,
        completedThisMonth: thisMonth,
      });

      // Prefer the business created date; createdAt is the database insert timestamp.
      const sorted = [...workOrders].sort(
        (a, b) => new Date(b.createdDate || b.createdAt) - new Date(a.createdDate || a.createdAt)
      );
      setRecentOrders(sorted.slice(0, 5));

      // Status distribution
      const dist = {};
      workOrders.forEach((w) => {
        dist[w.status] = (dist[w.status] || 0) + 1;
      });
      setStatusDist(dist);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Assets',
      value: stats.totalAssets,
      icon: Box,
      color: 'bg-blue-500',
      link: '/assets',
    },
    {
      label: 'Active Technicians',
      value: stats.activeTechnicians,
      icon: Users,
      color: 'bg-green-500',
      link: '/technicians',
    },
    {
      label: 'Open Work Orders',
      value: stats.openWorkOrders,
      icon: ClipboardList,
      color: 'bg-yellow-500',
      link: '/work-orders',
    },
    {
      label: 'Completed This Month',
      value: stats.completedThisMonth,
      icon: CheckCircle2,
      color: 'bg-purple-500',
      link: '/work-orders',
    },
  ];

  const statusBarColors = {
    OPEN: 'bg-green-500',
    ASSIGNED: 'bg-yellow-500',
    IN_PROGRESS: 'bg-blue-500',
    COMPLETED: 'bg-purple-500',
    CANCELLED: 'bg-red-500',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const totalWOs = Object.values(statusDist).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Overview of your maintenance operations</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.color} bg-opacity-10`}>
                <card.icon
                  className={`h-7 w-7 ${card.color.replace('bg-', 'text-')}`}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-indigo-600 font-medium group-hover:gap-2 transition-all">
              View details <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Work Orders
            </h3>
            <Link
              to="/work-orders"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No work orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">WO Number</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((wo) => (
                    <tr
                      key={wo.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <Link
                          to={`/work-orders/${wo.id}`}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                        >
                          {wo.workOrderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {wo.maintenanceType?.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge value={wo.priority} type="priority" />
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge value={wo.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Status Distribution
            </h3>
          </div>
          {totalWOs === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p>No data available</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {/* Stacked bar */}
              <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
                {Object.entries(statusDist).map(([status, count]) => (
                  <div
                    key={status}
                    className={`${statusBarColors[status] || 'bg-gray-400'} transition-all`}
                    style={{ width: `${(count / totalWOs) * 100}%` }}
                    title={`${status}: ${count}`}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="space-y-3 mt-4">
                {Object.entries(statusDist).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${statusBarColors[status] || 'bg-gray-400'}`}
                      />
                      <span className="text-sm text-gray-600">
                        {status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
