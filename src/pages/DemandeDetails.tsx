import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, Download, RefreshCw } from 'lucide-react';
import { demandeApi } from '../api/demandeApi';
import { validationApi } from '../api/validationApi';
import { documentApi } from '../api/documentApi';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Navbar from '../components/Navbar';

interface Etudiant {
  id: number;
  prenom: string;
  nom: string;
  email: string;
}

interface Demande {
  id: number;
  document_type: string;
  motif: string;
  status: string;
  created_at: string;
  student?: Etudiant;
}

interface Validation {
  id: number;
  action: string;
  comment: string;
  validation_date: string;
  validator_role: string;
}

const DemandeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [demande, setDemande] = useState<Demande | null>(null);
  const [validations, setValidations] = useState<Validation[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationData, setValidationData] = useState({
    action: 'valider',
    comment: '',
    request_id: id ? parseInt(id) : 0,
  });

  const fetchDemande = async () => {
    if (!id) return;
    
    try {
      const [demandeResponse, validationsResponse] = await Promise.all([
        demandeApi.getById(parseInt(id)),
        validationApi.getValidationHistory(parseInt(id)),
      ]);

      console.log('Détails de la demande:', demandeResponse);
      console.log('Historique des validations:', validationsResponse);
      
      setDemande(demandeResponse);
      setValidations(validationsResponse);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemande();
  }, [id]);

  const handleValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setValidationLoading(true);

    try {
      await validationApi.validate(validationData);
      await fetchDemande(); // Refresh data
      setValidationData({ ...validationData, action: 'valider', comment: '' });
    } catch (error) {
      console.error('Erreur validation:', error);
    } finally {
      setValidationLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!id) return;
    
    try {
      const blob = await documentApi.downloadPdf(parseInt(id));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    }
  };

  const canValidate = () => {
    if (!demande || user?.role === 'etudiant') return false;
    
    const roleValidationMap: Record<string, string> = {
      'secretaire': 'soumise',
      'libraire': 'validee_secretaire',
      'bibliothecaire': 'validee_libraire',
      'comptable': 'validee_bibliothecaire',
      'doyen': 'validee_comptable',
    };

    return demande.status === roleValidationMap[user?.role || ''];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <div className="text-gray-500">Demande non trouvée</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Détails de la demande</h1>
              <p className="mt-1 text-gray-600">Demande #{demande.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Demande info */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-600 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">
                        Informations de la demande
                      </h2>
                    </div>
                    <StatusBadge status={demande.status} />
                  </div>
                </div>
                
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type de document</dt>
                    <dd className="mt-1 text-sm text-gray-900">{demande.document_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Motif</dt>
                    <dd className="mt-1 text-sm text-gray-900">{demande.motif}</dd>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Soumise le {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  {user?.role !== 'etudiant' && demande.student && (
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      {demande.student.prenom} {demande.student.nom} ({demande.student.email})
                    </div>
                  )}
                </div>
              </div>

              {/* Validation form for admins */}
              {canValidate() && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Validation</h3>
                  </div>
                  <form onSubmit={handleValidation} className="px-6 py-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Décision
                      </label>
                      <select
                        value={validationData.action}
                        onChange={(e) => setValidationData({...validationData, action: e.target.value})}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="valider">Valider</option>
                        <option value="refuser">Refuser</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commentaire
                      </label>
                      <textarea
                        rows={3}
                        value={validationData.comment}
                        onChange={(e) => setValidationData({...validationData, comment: e.target.value})}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        placeholder="Commentaire optionnel..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={validationLoading}
                      className={`px-4 py-2 text-sm font-medium rounded-md text-white ${
                        validationData.action === 'valider' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      } disabled:opacity-50`}
                    >
                      {validationLoading ? 'Traitement...' : `${validationData.action === 'valider' ? 'Valider' : 'Refuser'} la demande`}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                  {demande.status === 'terminee' && (
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger PDF
                    </button>
                  )}
                </div>
              </div>

              {/* Validation history */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Historique</h3>
                </div>
                <div className="px-6 py-4">
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {validations.map((validation, idx) => (
                        <li key={validation.id}>
                          <div className="relative pb-8">
                            {idx !== validations.length - 1 && (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                            )}
                            <div className="relative flex space-x-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                validation.action === 'valider' ? 'bg-green-500' : 'bg-red-500'
                              } ring-8 ring-white`}>
                                <span className="text-white text-xs font-bold">
                                  {validation.action === 'valider' ? '✓' : '✗'}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium text-gray-900">
                                      {validation.validator_role}
                                    </span>{' '}
                                    a {validation.action === 'valider' ? 'validé' : 'refusé'} la demande
                                  </p>
                                  <p className="mt-1 text-xs text-gray-400">
                                    {new Date(validation.validation_date).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                                {validation.comment && (
                                  <div className="mt-2 text-sm text-gray-700">
                                    <p className="italic">"{validation.comment}"</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandeDetails;