import api from './apiClient';

export const documentApi = {
  downloadPdf: async (demandeId: number) => {
    const response = await api.get(`/documents/${demandeId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};