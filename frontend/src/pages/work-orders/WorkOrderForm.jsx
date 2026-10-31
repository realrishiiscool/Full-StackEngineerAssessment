import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import workOrdersApi from '../../api/workOrders';
import assetsApi from '../../api/assets';
import techniciansApi from '../../api/technicians';

const MAINTENANCE_TYPES = ['INSPECTION', 'PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const localToday = () => {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
};

const initialForm = {
  workOrderNumber: '',
  assetId: '',
  maintenanceType: 'PREVENTIVE',
  description: '',
  priority: 'MEDIUM',
  assignedTechnicianId: '',
  scheduledDate: '',
};

export default function WorkOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    loadDropdowns();
    if (isEdit) fetchWorkOrder();
  }, [id]);

  const loadDropdowns = async () => {
    try {
      const [assetsRes, techsRes] = await Promise.all([
        assetsApi.getAll(),
        techniciansApi.getAll(),
      ]);
      setAssets(assetsRes.data.data || assetsRes.data || []);
      setTechnicians(techsRes.data.data || techsRes.data || []);
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    }
  };

  const fetchWorkOrder = async () => {
    try {
      setFetching(true);
      const res = await workOrdersApi.getById(id);
      const wo = res.data.data || res.data;
      setForm({
        workOrderNumber: wo.workOrderNumber || '',
        assetId: wo.assetId || (wo.Asset?.id) || '',
        maintenanceType: wo.maintenanceType || 'PREVENTIVE',
        description: wo.description || '',
        priority: wo.priority || 'MEDIUM',
        assignedTechnicianId: wo.assignedTechnicianId || (wo.Technician?.id) || '',
        scheduledDate: wo.scheduledDate ? wo.scheduledDate.substring(0, 10) : '',
      });
    } catch (err) {
      toast.error('Failed to load work order');
      navigate('/work-orders');
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.workOrderNumber.trim()) errs.workOrderNumber = 'Work order number is required';
    if (!form.assetId) errs.assetId = 'Asset is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!isEdit && !form.scheduledDate) errs.scheduledDate = 'Scheduled date is required';
    if (!isEdit && form.scheduledDate) {
      if (form.scheduledDate < localToday()) errs.scheduledDate = 'A new work order cannot be scheduled in the past';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = { ...form };
      // Convert IDs to numbers
      payload.assetId = Number(payload.assetId);
      if (payload.assignedTechnicianId) {
        payload.assignedTechnicianId = Number(payload.assignedTechnicianId);
      } else {
        payload.assignedTechnicianId = null;
      }

      if (isEdit) {
        await workOrdersApi.update(id, payload);
        toast.success('Work order updated successfully');
      } else {
        await workOrdersApi.create(payload);
        toast.success('Work order created successfully');
      }
      navigate('/work-orders');
    } catch (err) {
      const errData = err.response?.data?.error;
      const msg = typeof errData === 'object' ? errData.message : errData || 'Failed to save work order';
      toast.error(typeof msg === 'string' ? msg : 'Failed to save work order');

      if (errData?.details && Array.isArray(errData.details)) {
        const apiErrors = {};
        errData.details.forEach((d) => {
          apiErrors[d.field] = d.message;
        });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate('/work-orders')} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Work Orders
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Work Order' : 'Create Work Order'}</h2>
        <p className="text-gray-500 mt-1">{isEdit ? 'Update work order details' : 'Create a new maintenance work order'}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {/* Work Order Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Work Order Number <span className="text-red-500">*</span></label>
          <input type="text" value={form.workOrderNumber} onChange={(e) => handleChange('workOrderNumber', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.workOrderNumber ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            placeholder="e.g., WO-2024-007" />
          {errors.workOrderNumber && <p className="text-xs text-red-500 mt-1">{errors.workOrderNumber}</p>}
        </div>

        {/* Asset */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asset <span className="text-red-500">*</span></label>
          <select value={form.assetId} onChange={(e) => handleChange('assetId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.assetId ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
            <option value="">Select an asset...</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>{a.assetId} — {a.manufacturer} {a.model}</option>
            ))}
          </select>
          {errors.assetId && <p className="text-xs text-red-500 mt-1">{errors.assetId}</p>}
        </div>

        {/* Maintenance Type & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
            <select value={form.maintenanceType} onChange={(e) => handleChange('maintenanceType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              {MAINTENANCE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={form.priority} onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
          <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={4}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            placeholder="Describe the maintenance work to be performed..." />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Assigned Technician */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Technician</label>
          <select value={form.assignedTechnicianId} onChange={(e) => handleChange('assignedTechnicianId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">Unassigned</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>{t.name} — {t.skill}</option>
            ))}
          </select>
        </div>

        {/* Scheduled Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
          <input type="date" min={!isEdit ? localToday() : undefined} required={!isEdit} value={form.scheduledDate} onChange={(e) => handleChange('scheduledDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.scheduledDate ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
          {errors.scheduledDate && <p className="text-xs text-red-500 mt-1">{errors.scheduledDate}</p>}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="button" onClick={() => navigate('/work-orders')} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg mr-3 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm disabled:opacity-50 transition-colors shadow-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'Update Work Order' : 'Create Work Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
