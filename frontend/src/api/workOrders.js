import client from './client';

const workOrdersApi = {
  getAll: async (params = {}) => {
    // The page/dashboard compute their own display slices, so collect every API
    // page instead of silently limiting them to the server's first 10 rows.
    const pageSize = 100;
    const first = await client.get('/work-orders', {
      params: { ...params, page: 1, limit: pageSize },
    });
    const totalPages = first.data.pagination?.totalPages || 1;
    if (totalPages <= 1) return first;

    const remaining = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        client.get('/work-orders', {
          params: { ...params, page: index + 2, limit: pageSize },
        })
      )
    );
    first.data = {
      ...first.data,
      data: [first.data.data || [], ...remaining.map((response) => response.data.data || [])].flat(),
      pagination: { ...first.data.pagination, loadedPages: totalPages },
    };
    return first;
  },
  getById: (id) => client.get(`/work-orders/${id}`),
  create: (data) => client.post('/work-orders', data),
  update: (id, data) => client.put(`/work-orders/${id}`, data),
  updateStatus: (id, status) =>
    client.patch(`/work-orders/${id}/status`, { status }),
};

export default workOrdersApi;
