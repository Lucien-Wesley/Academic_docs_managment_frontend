import api from './apiClient';

export const demandeApi = {
  getAll: async () => {
    const response = await api.get('/demandes');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/demandes/${id}`);
    return response.data;
  },

  create: async (demandeData: any) => {
    const response = await api.post('/demandes', demandeData);
    return response.data;
  },

  update: async (id: number, demandeData: any) => {
    const response = await api.put(`/demandes/${id}`, demandeData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/demandes/${id}`);
    return response.data;
  },

  submit: async (id: number) => {
    const response = await api.post(`/demandes/${id}/submit`);
    return response.data;
  },

  uploadEvidence: async (demandeId: number, formData: FormData ) => {
    const response = await api.post(`/evidences/${demandeId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
    return response.data
  }
};