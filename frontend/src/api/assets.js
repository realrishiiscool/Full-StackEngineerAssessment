import client from './client';

const assetsApi = {
  getAll: (params = {}) => client.get('/assets', { params }),
  getById: (id) => client.get(`/assets/${id}`),
  create: (data) => client.post('/assets', data),
  update: (id, data) => client.put(`/assets/${id}`, data),
  getWorkOrders: (id) => client.get(`/assets/${id}/work-orders`),
};

export default assetsApi;
