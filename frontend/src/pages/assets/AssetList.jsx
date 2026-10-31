import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Box, Loader2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import assetsApi from '../../api/assets';

const ASSET_TYPES = [
  'MECHANICAL',
  'ELECTRICAL',
  'HYDRAULIC',
  'PNEUMATIC',
  'ELECTRONIC',
];

const ASSET_STATUSES = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'];

export default function AssetList() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    assetType: '',
    status: '',
    manufacturer: '',
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await assetsApi.getAll();
      setAssets(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = assets.filter((a) => {
    if (filters.assetType && a.assetType !== filters.assetType) return false;
    if (filters.status && a.status !== filters.status) return false;
    if (
      filters.manufacturer &&
      !a.manufacturer?.toLowerCase().includes(filters.manufacturer.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assets</h2>
          <p className="text-gray-500 mt-1">Manage your maintenance assets</p>
        </div>
        <Link
          to="/assets/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Asset
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.assetType}
            onChange={(e) =>
              setFilters((f) => ({ ...f, assetType: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">All Types</option>
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">All Statuses</option>
            {ASSET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by manufacturer..."
              value={filters.manufacturer}
              onChange={(e) =>
                setFilters((f) => ({ ...f, manufacturer: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Box className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-lg font-medium">No assets found</p>
            <p className="text-sm mt-1">
              {assets.length === 0
                ? 'Create your first asset to get started'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Asset ID</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Manufacturer</th>
                  <th className="px-6 py-3">Model</th>
                  <th className="px-6 py-3">Serial</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                      {asset.assetId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {asset.assetType?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {asset.manufacturer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {asset.model}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {asset.serialNumber}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge value={asset.status} />
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
