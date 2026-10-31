import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Loader2, ClipboardList } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import assetsApi from '../../api/assets';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetRes, woRes] = await Promise.all([
        assetsApi.getById(id),
        assetsApi.getWorkOrders(id).catch(() => ({ data: { data: [] } })),
      ]);
      setAsset(assetRes.data.data || assetRes.data);
      setWorkOrders(woRes.data.data || woRes.data || []);
    } catch (err) {
      console.error('Failed to load asset:', err);
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!asset) return null;

  const infoItems = [
    { label: 'Asset ID', value: asset.assetId },
    { label: 'Type', value: asset.assetType?.replace(/_/g, ' ') },
    { label: 'Manufacturer', value: asset.manufacturer },
    { label: 'Model', value: asset.model },
    { label: 'Serial Number', value: asset.serialNumber },
    { label: 'Usage Hours', value: asset.usageHours },
    { label: 'Usage Cycles', value: asset.usageCycles },
  ];

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/assets')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Assets
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {asset.assetId}
            </h2>
            <p className="text-gray-500 mt-1">
              {asset.manufacturer} {asset.model}
            </p>
          </div>
          <button
            onClick={() => navigate(`/assets/${id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm"
          >
            <Edit className="h-4 w-4" /> Edit Asset
          </button>
        </div>
      </div>

      {/* Asset Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Asset Information
          </h3>
          <StatusBadge value={asset.status} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {infoItems.map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {item.value ?? '—'}
              </p>
            </div>
          ))}
        </div>
        {asset.createdAt && (
          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
            Created: {new Date(asset.createdAt).toLocaleDateString()} | Last
            updated: {new Date(asset.updatedAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Maintenance History */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Maintenance History
          </h3>
        </div>
        {workOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ClipboardList className="h-10 w-10 mb-3 opacity-50" />
            <p className="font-medium">No maintenance records</p>
            <p className="text-sm mt-1">
              Work orders for this asset will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">WO Number</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Scheduled</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workOrders.map((wo) => (
                  <tr
                    key={wo.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/work-orders/${wo.id}`)}
                  >
                    <td className="px-6 py-3 text-sm font-medium text-indigo-600">
                      {wo.workOrderNumber}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {wo.maintenanceType?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge value={wo.priority} type="priority" />
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {wo.scheduledDate
                        ? new Date(wo.scheduledDate).toLocaleDateString()
                        : '—'}
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
    </div>
  );
}
