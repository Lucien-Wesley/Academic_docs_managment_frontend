import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle, Upload, CheckCircle } from 'lucide-react';
import { demandeApi } from '../api/demandeApi';
import Navbar from '../components/Navbar';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DocumentType, DocumentTypeLabels } from '../types/documentTypes';

type EvidenceInput = {
  file: File;
  type: string;
};

const NewDemande: React.FC = () => {
  // --- ÉTATS ---
  const [step, setStep] = useState(1); // Étape 1: Formulaire, Étape 2: Preuves
  const [demandeId, setDemandeId] = useState<number | null>(null);
  const [evidences, setEvidences] = useState<EvidenceInput[]>([]);
  const [formData, setFormData] = useState({
    document_type: [] as string[],
    motif: '',
    pattern: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const navigate = useNavigate();

  // --- DONNÉES ---
  const documentCategories: Record<string, DocumentType[]> = {
    'Relevés de notes': [
      DocumentType.RELEVE_NOTES_L0,
      DocumentType.RELEVE_NOTES_L1,
      DocumentType.RELEVE_NOTES_L2,
      DocumentType.RELEVE_NOTES_L3,
      DocumentType.RELEVE_NOTES_M1,
      DocumentType.RELEVE_NOTES_M2,
    ],
    'Attestations': [
      DocumentType.ATTESTATION_REUSSITE_L0,
      DocumentType.ATTESTATION_REUSSITE_L1,
      DocumentType.ATTESTATION_REUSSITE_L2,
      DocumentType.ATTESTATION_REUSSITE_L3,
      DocumentType.ATTESTATION_REUSSITE_M1,
      DocumentType.ATTESTATION_REUSSITE_M2,
      DocumentType.ATTESTATION_FREQUENTATION,
    ],
    'Diplômes': [
      DocumentType.DIPLOME_LICENCE,
      DocumentType.DIPLOME_MASTER,
    ],
  };

  const evidenceTypes = [
    'Reçu de paiement', 
    'Attestation d’ordre avec la faculté', 
    'Décision administrative',
    'Autre'
  ];

  // --- LOGIQUE STEP 1: CRÉATION ---
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.document_type.length === 0) {
      setError('Sélectionnez au moins un type de document');
      return;
    }

    setLoading(true);
    try {
      // On crée la demande (elle passe en mode "Brouillon" côté API normalement)
      const res = await demandeApi.create(formData);
      setDemandeId(res.id);
      setStep(2); // On passe à l'étape des preuves
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création de la demande");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIQUE STEP 2: PREUVES ET FIN ---
  const handleStep2Submit = async () => {
    if (!demandeId) return;
    setError('');
    setLoading(true);
    try {
      // 1. Upload des preuves s'il y en a
      if (evidences.length > 0) {
        for (const ev of evidences) {
          if (!ev.type) {
            setError(`Veuillez sélectionner un type pour le fichier ${ev.file.name}`);
            setLoading(false);
            return;
          }
        }
        await uploadEvidences(demandeId);
      }
      // 2. Soumission finale (Change le statut de brouillon à soumis)
      await demandeApi.submit(demandeId);
      navigate('/dashboard');
    } catch (err: any) {
      setError("Erreur lors de l'envoi des preuves ou de la soumission");
    } finally {
      setLoading(false);
    }
  };

  const uploadEvidences = async (id: number) => {
    for (const ev of evidences) {
      const data = new FormData();
      data.append('file', ev.file);
      data.append('description', ev.type);
      await demandeApi.uploadEvidence(id, data);
    }
  };

  // --- HANDLERS DIVERS ---
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleDocumentType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      document_type: prev.document_type.includes(type)
        ? prev.document_type.filter(t => t !== type)
        : [...prev.document_type, type],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newEvidences: EvidenceInput[] = Array.from(e.target.files).map(file => ({
      file,
      type: '',
    }));
    setEvidences(prev => [...prev, ...newEvidences]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header avec indicateur d'étapes */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-md">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Nouvelle demande</h1>
          </div>
          <div className="flex space-x-2">
            <span className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}></span>
            <span className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* STEP 1 : INFORMATIONS */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="p-6 space-y-6">
              <div className="flex items-center border-b pb-4">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-medium">Étape 1 : Détails de la demande</h2>
              </div>

              {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg flex items-center"><AlertCircle className="h-4 w-4 mr-2"/> {error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de document *</label>
                <div className="space-y-3">
                  {Object.entries(documentCategories).map(([category, types]) => (
                    <div key={category} className="border border-gray-300 rounded-md">
                      <button type="button" onClick={() => setOpenCategory(openCategory === category ? null : category)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                        <span className="font-medium text-gray-700">{category}</span>
                        {openCategory === category ? <ChevronDown /> : <ChevronRight />}
                      </button>
                      {openCategory === category && (
                        <div className="px-4 pb-4 pt-2 border-t bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {types.map(typeEnum => {
                            const checked = formData.document_type.includes(typeEnum);

                            return (
                              <label key={typeEnum} className={`flex items-center p-3 border rounded-md cursor-pointer
                                                                ${checked
                                                                  ? 'border-green-500 bg-green-50'
                                                                  : 'border-gray-300 hover:bg-white'
                                                                }`}
>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleDocumentType(typeEnum)} // Envoie la valeur technique (ex: 'releve_notes_l0')
                                  className="h-4 w-4 text-green-600 rounded"
                                />
                                <span className="ml-3 text-sm">
                                  {DocumentTypeLabels[typeEnum]} {/* Affiche le texte lisible (ex: 'Relevé de notes L0') */}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motif de la demande *</label>
                <textarea name="motif" required rows={4} value={formData.motif} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                  {loading ? 'Enregistrement...' : 'Suivant : Ajouter les preuves'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2 : PREUVES */}
          {step === 2 && (
            <div className="p-6 space-y-6">
              <div className="flex items-center border-b pb-4 text-green-600">
                <Upload className="h-5 w-5 mr-2" />
                <h2 className="text-lg font-medium">Étape 2 : Pièces justificatives</h2>
              </div>

              <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
                Votre demande a été enregistrée en brouillon. Vous pouvez ajouter les preuves maintenant.
              </div>

              <input type="file" multiple onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>

              <div className="space-y-3">
                {evidences.map((ev, index) => (
                  <div key={index} className="p-3 border rounded-md bg-gray-50 flex flex-col space-y-2">
                    <div className="flex justify-between font-medium text-sm">
                      <span className="truncate">{ev.file.name}</span>
                      <button onClick={() => setEvidences(evidences.filter((_, i) => i !== index))} className="text-red-600">Supprimer</button>
                    </div>
                    <select 
                      value={ev.type} 
                      onChange={(e) => {
                        const newEv = [...evidences];
                        newEv[index].type = e.target.value;
                        setEvidences(newEv);
                      }}
                      className="w-full px-3 py-2 border rounded-md
                       focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Sélectionnez le type de preuve *</option>
                      {evidenceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                {/* <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:underline">
                  Finaliser plus tard (Garder en brouillon)
                </button> */}
                <button 
                  onClick={handleStep2Submit} 
                  disabled={loading} 
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  {loading ? 'Envoi...' : <><CheckCircle className="h-4 w-4 mr-2"/> Terminer la soumission</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewDemande;