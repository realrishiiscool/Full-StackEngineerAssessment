import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import assetsApi from '../../api/assets';

const ASSET_TYPES = [
  'MECHANICAL',
  'ELECTRICAL',
  'HYDRAULIC',
  'PNEUMATIC',
  'ELECTRONIC',
];

const ASSET_STATUSES = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'];

const initialForm = {
  assetId: '',
  assetType: 'MECHANICAL',
  manufacturer: '',
  model: '',
  serialNumber: '',
  usageHours: 0,
  usageCycles: 0,
  status: 'ACTIVE',
};

export default function AssetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchAsset();
    }
  }, [id]);

  const fetchAsset = async () => {
    try {
      setFetching(true);
      const res = await assetsApi.getById(id);
      const asset = res.data.data || res.data;
      setForm({
        assetId: asset.assetId || '',
        assetType: asset.assetType || 'MECHANICAL',
        manufacturer: asset.manufacturer || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        usageHours: asset.usageHours || 0,
        usageCycles: asset.usageCycles || 0,
        status: asset.status || 'ACTIVE',
      });
    } catch (err) {
      toast.error('Failed to load asset');
      navigate('/assets');
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.assetId.trim()) errs.assetId = 'Asset ID is required';
    if (!form.manufacturer.trim()) errs.manufacturer = 'Manufacturer is required';
    if (!form.model.trim()) errs.model = 'Model is required';
    if (!form.serialNumber.trim()) errs.serialNumber = 'Serial number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        ...form,
        usageHours: Number(form.usageHours),
        usageCycles: Number(form.usageCycles),
      };

      if (isEdit) {
        await assetsApi.update(id, payload);
        toast.success('Asset updated successfully');
      } else {
        await assetsApi.create(payload);
        toast.success('Asset created successfully');
      }
      navigate('/assets');
    } catch (err) {
      const errData = err.response?.data?.error;
      const msg = typeof errData === 'object' ? errData.message : errData || 'Failed to save asset';
      toast.error(msg);

      if (err.response?.data?.error?.details && Array.isArray(err.response.data.error.details)) {
        const apiErrors = {};
        err.response.data.error.details.forEach((d) => {
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
        <button
          onClick={() => navigate('/assets')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Assets
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Asset' : 'Create Asset'}
        </h2>
        <p className="text-gray-500 mt-1">
          {isEdit
            ? 'Update asset information'
            : 'Add a new asset to the system'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 space-y-5"
      >
        {/* Asset ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.assetId}
            onChange={(e) => handleChange('assetId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.assetId ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="e.g., AST-001"
          />
          {errors.assetId && (
            <p className="text-xs text-red-500 mt-1">{errors.assetId}</p>
          )}
        </div>

        {/* Asset Type & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Type
            </label>
            <select
              value={form.assetType}
              onChange={(e) => handleChange('assetType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {ASSET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Manufacturer & Model */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.manufacturer ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., Caterpillar"
            />
            {errors.manufacturer && (
              <p className="text-xs text-red-500 mt-1">{errors.manufacturer}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.model ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., CAT-3516"
            />
            {errors.model && (
              <p className="text-xs text-red-500 mt-1">{errors.model}</p>
            )}
          </div>
        </div>

        {/* Serial Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serial Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.serialNumber}
            onChange={(e) => handleChange('serialNumber', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.serialNumber ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="e.g., SN-12345"
          />
          {errors.serialNumber && (
            <p className="text-xs text-red-500 mt-1">{errors.serialNumber}</p>
          )}
        </div>

        {/* Usage Hours & Cycles */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Hours
            </label>
            <input
              type="number"
              min="0"
              value={form.usageHours}
              onChange={(e) => handleChange('usageHours', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Cycles
            </label>
            <input
              type="number"
              min="0"
              value={form.usageCycles}
              onChange={(e) => handleChange('usageCycles', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/assets')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg mr-3 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEdit ? 'Update Asset' : 'Create Asset'}
          </button>
        </div>
      </form>
    </div>
  );
}
