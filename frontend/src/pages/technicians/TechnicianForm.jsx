import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import techniciansApi from '../../api/technicians';

const SKILLS = ['MECHANICAL', 'ELECTRICAL', 'PLUMBING', 'GENERAL', 'SPECIALIST'];
const TECH_STATUSES = ['AVAILABLE', 'BUSY', 'OFF_DUTY'];

const initialForm = {
  name: '',
  skill: 'MECHANICAL',
  status: 'AVAILABLE',
};

export default function TechnicianForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isEdit) fetchTechnician();
  }, [id]);

  const fetchTechnician = async () => {
    try {
      setFetching(true);
      const res = await techniciansApi.getById(id);
      const tech = res.data.data || res.data;
      setForm({
        name: tech.name || '',
        skill: tech.skill || 'MECHANICAL',
        status: tech.status || 'AVAILABLE',
      });
    } catch (err) {
      toast.error('Failed to load technician');
      navigate('/technicians');
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      if (isEdit) {
        await techniciansApi.update(id, form);
        toast.success('Technician updated successfully');
      } else {
        await techniciansApi.create(form);
        toast.success('Technician created successfully');
      }
      navigate('/technicians');
    } catch (err) {
      const errData = err.response?.data?.error;
      const msg = typeof errData === 'object' ? errData.message : errData || 'Failed to save technician';
      toast.error(msg);
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
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <button onClick={() => navigate('/technicians')} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Technicians
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Technician' : 'Add Technician'}</h2>
        <p className="text-gray-500 mt-1">{isEdit ? 'Update technician information' : 'Register a new technician'}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
          <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            placeholder="e.g., John Smith" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
          <select value={form.skill} onChange={(e) => handleChange('skill', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            {TECH_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="button" onClick={() => navigate('/technicians')} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg mr-3 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm disabled:opacity-50 transition-colors shadow-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'Update Technician' : 'Add Technician'}
          </button>
        </div>
      </form>
    </div>
  );
}
