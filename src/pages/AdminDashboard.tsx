import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validationApi } from '../api/validationApi';
import DemandCard from '../components/DemandCard';
import Navbar from '../components/Navbar';

interface Demande {
  id: number;
  type_document: string;
  motif: string;
  status: string;
  created_at: string;
  student?: {
    id: number;
    prenom: string;
    nom: string;
    email: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingValidations = async () => {
    try {
      setLoading(true);
      const response = await validationApi.getPendingValidations();
      setDemandes(response);
      setError('');
    } catch (error) {
      setError('Erreur lors du chargement des demandes');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingValidations();
  }, []);

  const getRoleTitle = (role: string | undefined) => {
    const titles: Record<string, string> = {
      'secretaire': 'Secrétariat',
      'doyen': 'Doyen',
      'libraire': 'Librairie',
      'bibliothecaire': 'Bibliothécaire',
      'comptable': 'Comptable',
      'archives': 'Archives'
    };
    return titles[role || ''] || role;
  };

  const getNextStepMessage = (role: string | undefined) => {
    const messages: Record<string, string> = {
      'secretaire': 'Demandes en attente de validation par le secrétariat',
      'doyen': 'Demandes validées par le secrétariat, en attente de votre validation',
      'archives': 'Demandes validées par le doyen, en attente de validation finale'
    };
    return messages[role || ''] || 'Demandes en attente de validation';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard {getRoleTitle(user?.role)}
              </h1>
              <p className="mt-1 text-gray-600">
                {getNextStepMessage(user?.role)}
              </p>
            </div>
            <button
              onClick={fetchPendingValidations}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">{demandes.length}</div>
                  <div className="text-gray-600">En attente</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {new Set(demandes.map(d => d.student?.id)).size}
                  </div>
                  <div className="text-gray-600">Étudiants concernés</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-600 rounded mr-3 flex items-center justify-center">
                  <span className="text-white font-bold">%</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {getRoleTitle(user?.role)}
                  </div>
                  <div className="text-gray-600">Votre rôle</div>
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Demandes list */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Demandes à traiter ({demandes.length})
            </h2>

            {demandes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 mb-2">Aucune demande en attente</div>
                <div className="text-sm text-gray-400">
                  Toutes les demandes ont été traitées pour le moment.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demandes.map((demande) => (
                  <DemandCard key={demande.id} demande={demande} isAdmin={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;