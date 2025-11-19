import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { demandeApi } from '../api/demandeApi';
import DemandCard from '../components/DemandCard';
import Navbar from '../components/Navbar';

interface Demande {
  id: number;
  type_document: string;
  motif: string;
  status: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const response = await demandeApi.getAll();
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
    fetchDemandes();
  }, []);

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
                Bienvenue, {user?.prenom} !
              </h1>
              <p className="mt-1 text-gray-600">
                Gérez vos demandes de documents académiques
              </p>
            </div>
            <Link
              to="/nouvelle-demande"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle demande
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{demandes.length}</div>
              <div className="text-gray-600">Total demandes</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">
                {demandes.filter(d => ['soumise', 'validee_secretariat', 'validee_doyen'].includes(d.status)).length}
              </div>
              <div className="text-gray-600">En cours</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {demandes.filter(d => d.status === 'terminee').length}
              </div>
              <div className="text-gray-600">Terminées</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">
                {demandes.filter(d => d.status === 'refusee').length}
              </div>
              <div className="text-gray-600">Refusées</div>
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Mes demandes</h2>
              <button
                onClick={fetchDemandes}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </button>
            </div>

            {demandes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">Aucune demande trouvée</div>
                <Link
                  to="/nouvelle-demande"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer votre première demande
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demandes.map((demande) => (
                  <DemandCard key={demande.id} demande={demande} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;