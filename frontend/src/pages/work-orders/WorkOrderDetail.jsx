import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Loader2,
  PlayCircle,
  CheckCircle2,
  XCircle,
  UserCheck,
  Clock,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import workOrdersApi from '../../api/workOrders';

// Define valid status transitions
const STATUS_TRANSITIONS = {
  OPEN: [
    { target: 'ASSIGNED', label: 'Assign', icon: UserCheck, color: 'bg-yellow-500 hover:bg-yellow-600' },
    { target: 'CANCELLED', label: 'Cancel', icon: XCircle, color: 'bg-red-500 hover:bg-red-600' },
  ],
  ASSIGNED: [
    { target: 'IN_PROGRESS', label: 'Start Work', icon: PlayCircle, color: 'bg-blue-500 hover:bg-blue-600' },
    { target: 'CANCELLED', label: 'Cancel', icon: XCircle, color: 'bg-red-500 hover:bg-red-600' },
  ],
  IN_PROGRESS: [
    { target: 'COMPLETED', label: 'Complete', icon: CheckCircle2, color: 'bg-purple-500 hover:bg-purple-600' },
  ],
  COMPLETED: [],
  CANCELLED: [],
};

export default function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wo, setWo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    fetchWorkOrder();
  }, [id]);

  const fetchWorkOrder = async () => {
    try {
      setLoading(true);
      const res = await workOrdersApi.getById(id);
      setWo(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to load work order:', err);
      navigate('/work-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'ASSIGNED' && !(wo.assignedTechnicianId || wo.Technician?.id || wo.assignedTechnician?.id)) {
      toast.error('Choose a technician before assigning this work order.');
      navigate(`/work-orders/${id}/edit`);
      return;
    }
    try {
      setTransitioning(true);
      await workOrdersApi.updateStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchWorkOrder();
    } catch (err) {
      const apiError = err.response?.data?.error;
      const msg = typeof apiError === 'string'
        ? apiError
        : apiError?.details || apiError?.message || err.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    } finally {
      setTransitioning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!wo) return null;

  // Sequelize serializes the associations using these aliases; retain support
  // for the legacy lowercase response shape too.
  const asset = wo.Asset || wo.asset || null;
  const technician = wo.Technician || wo.assignedTechnician || null;
  const assetId = asset?.id ?? asset?._id;
  const statusHistory = Array.isArray(wo.statusHistory) ? wo.statusHistory : [];
  const transitions = STATUS_TRANSITIONS[wo.status] || [];
  const isTerminal = wo.status === 'COMPLETED' || wo.status === 'CANCELLED';

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/work-orders')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Work Orders
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {wo.workOrderNumber}
              </h2>
              <StatusBadge value={wo.status} />
              <StatusBadge value={wo.priority} type="priority" />
            </div>
            <p className="text-gray-500 mt-1">
              {wo.maintenanceType?.replace(/_/g, ' ')} maintenance
            </p>
          </div>
          {!isTerminal && (
            <button
              onClick={() => navigate(`/work-orders/${id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm"
            >
              <Edit className="h-4 w-4" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Status Transition Buttons */}
      {transitions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm font-medium text-gray-600 mb-3">
            Available Actions
          </p>
          <div className="flex gap-3">
            {transitions.map((t) => (
              <button
                key={t.target}
                onClick={() => handleStatusChange(t.target)}
                disabled={transitioning}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50 ${t.color}`}
              >
                {transitioning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <t.icon className="h-4 w-4" />
                )}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Order Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Work Order Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maintenance Type
                </p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {wo.maintenanceType?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </p>
                <div className="mt-0.5">
                  <StatusBadge value={wo.priority} type="priority" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled Date
                </p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {wo.scheduledDate
                    ? new Date(wo.scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
            </div>

            {wo.completedDate && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {new Date(wo.completedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {wo.description && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {wo.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Asset & Technician Info */}
        <div className="space-y-6">
          {/* Asset Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Asset Information
            </h3>
            {asset ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {asset.assetId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {asset.manufacturer} {asset.model}
                    </p>
                  </div>
                  <StatusBadge value={asset.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      {asset.assetType?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Serial</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">
                      {asset.serialNumber}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/assets/${assetId}`}
                  className="inline-block text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-1"
                >
                  View asset →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Asset information not available
              </p>
            )}
          </div>

          {/* Technician Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assigned Technician
            </h3>
            {technician ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {technician.name}
                    </p>
                    <p className="text-xs text-gray-500">{technician.skill}</p>
                  </div>
                  <StatusBadge value={technician.status} />
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                No technician assigned
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
        <div className="space-y-4">
          {(wo.createdDate || wo.createdAt) && (
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0 ring-4 ring-green-50" />
              <div>
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-xs text-gray-500">
                  {new Date(wo.createdDate || wo.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {statusHistory.length > 0 ? statusHistory.map((event) => (
            <div key={event.id} className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 ring-4 ring-indigo-50" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {event.fromStatus
                    ? `${event.fromStatus.replace(/_/g, ' ')} → ${event.toStatus.replace(/_/g, ' ')}`
                    : `Created · ${event.toStatus.replace(/_/g, ' ')}`}
                </p>
                <p className="text-xs text-gray-500">
                  {event.changedAt ? new Date(event.changedAt).toLocaleString() : 'Date unavailable'}
                </p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-400">
              No status-change history is available for this older work order.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
