import client from './client';

const techniciansApi = {
  getAll: (params = {}) => client.get('/technicians', { params }),
  getById: (id) => client.get(`/technicians/${id}`),
  create: (data) => client.post('/technicians', data),
  update: (id, data) => client.put(`/technicians/${id}`, data),
};

export default techniciansApi;
