import api from './apiClient';

export const validationApi = {
  validate: async ( validationData: any) => {
    const response = await api.post(`/validations`, validationData);
    return response.data;
  },

  getValidationHistory: async (demandeId: number) => {
    const response = await api.get(`/validations/${demandeId}/history`);
    return response.data;
  },

  getPendingValidations: async () => {
    const response = await api.get('/validations/pending');
    return response.data;
  },
};