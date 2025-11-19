import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Download, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { documentApi } from '../api/documentApi';

interface Etudiant {
  id: number;
  prenom: string;
  nom: string;
  email: string;
}

interface Demande {
  id: number;
  type_document: string;
  motif: string;
  status: string;
  created_at: string;
  student?: Etudiant;
}

interface DemandCardProps {
  demande: Demande;
  isAdmin?: boolean;
}

const DemandCard: React.FC<DemandCardProps> = ({ demande, isAdmin = false }) => {
  const handleDownload = async () => {
    try {
      const blob = await documentApi.downloadPdf(demande.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `document_${demande.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {demande.type_document}
          </h3>
          <StatusBadge status={demande.status} />
        </div>
        <div className="text-right">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(demande.created_at).toLocaleDateString('fr-FR')}
          </div>
          {isAdmin && demande.student && (
            <div className="text-sm text-gray-600">
              {demande.student.prenom} {demande.student.nom}
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{demande.motif}</p>

      <div className="flex justify-between items-center">
        <Link
          to={`/demande/${demande.id}`}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <Eye className="h-4 w-4" />
          <span>Voir détails</span>
        </Link>

        {demande.status === 'terminee' && (
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger PDF</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DemandCard;