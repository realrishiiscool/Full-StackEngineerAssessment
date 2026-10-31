import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users, Loader2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import techniciansApi from '../../api/technicians';

const SKILLS = ['MECHANICAL', 'ELECTRICAL', 'PLUMBING', 'GENERAL', 'SPECIALIST'];
const TECH_STATUSES = ['AVAILABLE', 'BUSY', 'OFF_DUTY'];

export default function TechnicianList() {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ skill: '', status: '' });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const res = await techniciansApi.getAll();
      setTechnicians(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load technicians:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = technicians.filter((t) => {
    if (filters.skill && t.skill !== filters.skill) return false;
    if (filters.status && t.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Technicians</h2>
          <p className="text-gray-500 mt-1">Manage your maintenance technicians</p>
        </div>
        <Link
          to="/technicians/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Technician
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.skill}
            onChange={(e) => setFilters((f) => ({ ...f, skill: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">All Skills</option>
            {SKILLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">All Statuses</option>
            {TECH_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
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
            <Users className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-lg font-medium">No technicians found</p>
            <p className="text-sm mt-1">
              {technicians.length === 0
                ? 'Add your first technician to get started'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Skill</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((tech) => (
                  <tr key={tech.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{tech.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tech.skill}</td>
                    <td className="px-6 py-4"><StatusBadge value={tech.status} /></td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/technicians/${tech.id}/edit`)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </button>
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
