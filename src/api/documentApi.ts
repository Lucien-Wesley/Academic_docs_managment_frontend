import api from './apiClient';

export const documentApi = {
  // Télécharger la fiche de synthèse par demandeId
  downloadFiche: async (demandeId: number) => {
    const response = await api.get(`/documents/fiche/${demandeId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Télécharger un document spécifique par docId
  downloadAcademique: async (docId: number) => {
    const response = await api.get(`/documents/academique/${docId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  //Télécharger les preuves par evidence_id
  downloadEvidence: async (evidenceId: number) => {
    const response = await api.get(`/evidences/${evidenceId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};