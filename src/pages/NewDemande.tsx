import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import { demandeApi } from '../api/demandeApi';
import Navbar from '../components/Navbar';

const NewDemande: React.FC = () => {
  const [formData, setFormData] = useState({
    document_type: '',
    motif: '',
    pattern: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const documentTypes = [
    'Relevé de notes L0',
    'Relevé de notes L1',
    'Relevé de notes L2',
    'Relevé de notes L3',
    'Relevé de notes M1',
    'Relevé de notes M2',
    'Relevé de notes L0, L1',
    'Relevé de notes L0, L1, L2',
    'Relevé de notes L0, L1, L2, L3',
    'Relevé de notes M1, M2',
    'Attestation de réussite L0',
    'Attestation de réussite L1',
    'Attestation de réussite L2',
    'Attestation de réussite L3',
    'Attestation de réussite M1',
    'Attestation de réussite M2',
    'Attestation de réussite L0, L1',
    'Attestation de réussite L0, L1, L2',
    'Attestation de réussite L0, L1, L2, L3',
    'Attestation de réussite M1, M2',
    'Diplôme de Licence',
    'Diplôme de Master',
    'Attestation de Frequentation',
    'Autre',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await demandeApi.create(formData);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nouvelle demande</h1>
              <p className="mt-1 text-gray-600">
                Créez une nouvelle demande de document académique
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  Informations de la demande
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {error && (
                <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="document_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de document *
                </label>
                <select
                  id="document_type"
                  name="document_type"
                  required
                  value={formData.document_type}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Sélectionnez un type de document</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="motif" className="block text-sm font-medium text-gray-700 mb-2">
                  Motif de la demande *
                </label>
                <textarea
                  id="motif"
                  name="motif"
                  required
                  rows={4}
                  value={formData.motif}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Décrivez le motif de votre demande..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Expliquez pourquoi vous avez besoin de ce document (candidature, emploi, etc.)
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création...' : 'Soumettre la demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDemande;