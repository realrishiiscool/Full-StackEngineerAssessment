import React from 'react';

const statusColors = {
  // Work order statuses
  OPEN: 'bg-green-100 text-green-800',
  ASSIGNED: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',

  // Asset statuses
  ACTIVE: 'bg-green-100 text-green-800',
  UNDER_MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  OUT_OF_SERVICE: 'bg-red-100 text-red-800',
  RETIRED: 'bg-gray-100 text-gray-800',

  // Technician statuses
  AVAILABLE: 'bg-green-100 text-green-800',
  BUSY: 'bg-yellow-100 text-yellow-800',
  OFF_DUTY: 'bg-red-100 text-red-800',
  INACTIVE: 'bg-red-100 text-red-800',
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export default function StatusBadge({ value, type = 'status' }) {
  if (!value) return null;

  const colors =
    type === 'priority'
      ? priorityColors[value] || 'bg-gray-100 text-gray-700'
      : statusColors[value] || 'bg-gray-100 text-gray-700';

  const label = value.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors}`}
    >
      {label}
    </span>
  );
}
