import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import { demandeApi } from '../api/demandeApi';
import Navbar from '../components/Navbar';
import { ChevronDown, ChevronRight } from 'lucide-react';
type EvidenceInput = {
  file: File;
  type: string;
};

const NewDemande: React.FC = () => {

  const [evidences, setEvidences] = useState<EvidenceInput[]>([]);
  const [formData, setFormData] = useState({
    document_type: [] as string[],
    motif: '',
    pattern: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [files, setFiles] = useState<File[]>([]);
  const [demandeId, setDemandeId] = useState<number | null>(null);

  const [openCategory, setOpenCategory] = useState<string | null>(null);


  const navigate = useNavigate();


  const documentCategories: Record<string, string[]> = {
    'Relevés de notes': [
      'Relevé de notes L0',
      'Relevé de notes L1',
      'Relevé de notes L2',
      'Relevé de notes L3',
      'Relevé de notes M1',
      'Relevé de notes M2',
    ],
    'Attestations': [
      'Attestation de réussite L0',
      'Attestation de réussite L1',
      'Attestation de réussite L2',
      'Attestation de réussite L3',
      'Attestation de réussite M1',
      'Attestation de réussite M2',
      'Attestation de Fréquentation',
    ],
    'Diplômes': [
      'Diplôme de Licence',
      'Diplôme de Master',
    ],
  };

  const evidenceTypes = [
    'Reçu de paiement',
    'Attestation d’ordre avec la faculté',
    'Décision administrative',
    'Autre',
  ];



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (formData.document_type.length === 0) {
        setError('Sélectionnez au moins un type de document');
        return;
      }

      // 1️⃣ Création de la demande (JSON)
      const res = await demandeApi.create(formData);
      const demandeId = res.data.id;

      // 2️⃣ Upload des evidences (si présentes)
      if (files.length > 0) {
        await uploadEvidences(demandeId);
      }

      // 3️⃣ Soumission finale
      await demandeApi.submit(demandeId);

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
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

  const toggleDocumentType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      document_type: prev.document_type.includes(type)
        ? prev.document_type.filter(t => t !== type)
        : [...prev.document_type, type],
    }));
  };

  const toggleCategory = (category: string) => {
    setOpenCategory(prev =>
      prev === category ? null : category
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newEvidences: EvidenceInput[] = Array.from(e.target.files).map(file => ({
      file,
      type: '',
    }));

    setEvidences(prev => [...prev, ...newEvidences]);
  };

  const updateEvidenceType = (index: number, type: string) => {
  setEvidences(prev =>
    prev.map((ev, i) =>
      i === index ? { ...ev, type } : ev
    )
  );
};

  const removeEvidence = (index: number) => {
    setEvidences(prev => prev.filter((_, i) => i !== index));
  };

  const uploadEvidences = async (demandeId: number) => {
    for (const ev of evidences) {
      const formData = new FormData();
      formData.append('file', ev.file);
      formData.append('evidence_type', ev.type);

      await demandeApi.uploadEvidence(demandeId, formData);
    }
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

 <div className="space-y-3">
    {Object.entries(documentCategories).map(([category, types]) => {
      const isOpen = openCategory === category;

      return (
        <div
          key={category}
          className="border border-gray-300 rounded-md"
        >
          {/* Header catégorie */}
          <button
            type="button"
            onClick={() => toggleCategory(category)}
            className="w-full flex items-center justify-between px-4 py-3
                       text-left hover:bg-gray-50"
          >
            <span className="font-medium text-gray-700">
              {category}
            </span>

            <span className="text-gray-500">
              {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </span>
          </button>

          {/* Contenu catégorie */}
          {isOpen && (
            <div className="px-4 pb-4 pt-2 border-t bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {types.map(type => {
                  const checked = formData.document_type.includes(type);

                  return (
                    <label
                      key={type}
                      className={`flex items-center p-3 border rounded-md cursor-pointer
                        ${checked
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:bg-white'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDocumentType(type)}
                        className="h-4 w-4 text-green-600 rounded"
                      />
                      <span className="ml-3 text-sm">
                        {type}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>

  {formData.document_type.length > 0 && (
  <div className="mt-4">
    <p className="text-sm font-medium text-gray-700 mb-2">
      Documents sélectionnés :
    </p>

    <div className="flex flex-wrap gap-2">
      {formData.document_type.map(type => (
        <span
          key={type}
          className="inline-flex items-center px-3 py-1 rounded-full
                     text-sm bg-green-100 text-green-800"
        >
          {type}
          <button
            type="button"
            onClick={() => toggleDocumentType(type)}
            className="ml-2 text-green-700 hover:text-green-900"
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  </div>
)}


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

<div className="mt-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Preuves de régularité
  </label>

  <input
    type="file"
    accept=".pdf,image/*"
    multiple
    onChange={handleFileChange}
    className="block w-full text-sm text-gray-700
               file:mr-4 file:py-2 file:px-4
               file:rounded-md file:border-0
               file:bg-green-50 file:text-green-700
               hover:file:bg-green-100"
  />

  {evidences.length > 0 && (
    <div className="mt-4 space-y-3">
      {evidences.map((ev, index) => (
        <div
          key={index}
          className="p-3 border rounded-md bg-gray-50 space-y-2"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium truncate">
              {ev.file.name}
            </span>

            <button
              type="button"
              onClick={() => removeEvidence(index)}
              className="text-red-600 text-sm"
            >
              Supprimer
            </button>
          </div>

          <select
            value={ev.type}
            onChange={(e) => updateEvidenceType(index, e.target.value)}
            className="w-full px-3 py-2 border rounded-md
                       focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Sélectionnez le type de preuve *</option>
            {evidenceTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )}
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