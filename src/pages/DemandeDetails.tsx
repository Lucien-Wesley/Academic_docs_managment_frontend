import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, FileText, Download, RefreshCw, Paperclip, ShieldCheck, ExternalLink, CheckCircle } from 'lucide-react';
import { demandeApi } from '../api/demandeApi';
import { validationApi } from '../api/validationApi';
import { documentApi } from '../api/documentApi';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Navbar from '../components/Navbar';
import { DocumentTypeLabels } from '../types/documentTypes';

interface Etudiant {
  id: number;
  prenom: string;
  nom: string;
  email: string;
}

interface Evidence {
  id: number;
  description: string;
  filename: string;
  uploaded_at: string;
}

interface Document {
  id: number;
  type: string;
  filename: string;
  generated_at: string;
}

interface Demande {
  id: number;
  document_type: string[];
  motif: string;
  status: string;
  created_at: string;
  student?: Etudiant;
  evidences?: Evidence[];
  documents?: Document[];
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
      setDemande(demandeResponse);
      setValidations(validationsResponse);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDemande(); }, [id]);

  const handleDownloadFile = async (docId: number, docType: string) => {
  try {
    const blob = await documentApi.downloadAcademique(docId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docType}_${docId}.pdf`;
    a.click();
  } catch (err) {
    console.error("Erreur document", err);
  }
  };

  const handleDownload = async () => {
    if (!demande) return;
    try {
      const blob = await documentApi.downloadFiche(demande.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fiche_demande_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    catch (error) {
      console.error('Erreur de téléchargement :', error);
    }
  };

  const handleDownloadEvidence = async (evidenceId: number, filename: string) => {
    try {
      const blob = await documentApi.downloadEvidence(evidenceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur preuve", err);
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
      'academique': 'validee_doyen',
    };

    return demande.status === roleValidationMap[user?.role || ''];
  };

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

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin text-green-600" /></div>
    </div>
  );

  if (!demande) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="text-center py-12 text-gray-500">Demande non trouvée</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Pro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="mr-4 p-2 bg-white shadow-sm border rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Demande #{demande.id}</h1>
                <StatusBadge status={demande.status} />
              </div>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" /> Créée le {new Date(demande.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE : Fiche et Preuves */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. FICHE DE DEMANDE */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center text-gray-800">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  <h2 className="font-semibold text-lg">Fiche de demande</h2>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Types de documents</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {demande.document_type.map((type: any) => (
                        <span key={type} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100">
                          {DocumentTypeLabels[type as keyof typeof DocumentTypeLabels] || type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Motif officiel</label>
                    <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg text-sm border border-dashed border-gray-200">
                      {demande.motif}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 border-l pl-6 border-gray-100">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Demandeur</label>
                    <div className="flex items-center mt-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold mr-3">
                        {demande.student?.prenom[0]}{demande.student?.nom[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{demande.student?.prenom} {demande.student?.nom}</p>
                        <p className="text-xs text-gray-500">{demande.student?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. SECTION PREUVES (PIÈCES JOINTES) */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center">
                <Paperclip className="h-5 w-5 mr-2 text-orange-600" />
                <h2 className="font-semibold text-lg text-gray-800">Preuves de régularité</h2>
              </div>
              <div className="p-6">
                {demande.evidences && demande.evidences.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {demande.evidences.map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between p-4 border rounded-xl hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
                        <div className="flex items-center overflow-hidden">
                          <div className="p-2 bg-orange-100 rounded-lg mr-3 group-hover:bg-orange-200 transition-colors">
                            <ShieldCheck className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{ev.description || "Justificatif"}</p>
                            <p className="text-xs text-gray-400 truncate">{ev.filename}</p>
                          </div>
                        </div>
                        <button onClick={()=>handleDownloadEvidence(ev.id, ev.filename)} className="p-2 text-gray-400 hover:text-orange-600" title="Voir la preuve">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed rounded-xl text-gray-400 text-sm">
                    Aucune preuve jointe à cette demande.
                  </div>
                )}
              </div>
            </section>

            {canValidate() && (
              <section className="bg-white rounded-xl shadow-md border-2 border-blue-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex items-center">
                  <div className="p-2 bg-blue-600 rounded-lg mr-3 shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-blue-900 leading-tight">Console d'Approbation Administrative</h2>
                    <p className="text-[10px] uppercase tracking-widest text-blue-500 font-semibold mt-0.5">Autorité : {user?.role}</p>
                  </div>
                </div>

                <form onSubmit={handleValidation} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase">Décision</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setValidationData({ ...validationData, action: 'valider' })}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                            validationData.action === 'valider'
                              ? 'border-green-500 bg-green-50 text-green-700 shadow-inner'
                              : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                          }`}
                        >
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-bold text-sm">Approuver</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setValidationData({ ...validationData, action: 'refuser' })}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                            validationData.action === 'refuser'
                              ? 'border-red-500 bg-red-50 text-red-700 shadow-inner'
                              : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                          }`}
                        >
                          <ShieldCheck className="h-5 w-5" />
                          <span className="font-bold text-sm">Rejeter</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase">Observations</label>
                      <textarea
                        rows={2}
                        value={validationData.comment}
                        onChange={(e) => setValidationData({ ...validationData, comment: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                        placeholder="Note interne ou motif du rejet..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={validationLoading}
                      className={`flex items-center gap-3 px-10 py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                        validationData.action === 'valider'
                          ? 'bg-green-600 hover:bg-green-700 shadow-green-100'
                          : 'bg-red-600 hover:bg-red-700 shadow-red-100'
                      } disabled:opacity-50`}
                    >
                      {validationLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Signer & Transmettre"}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>

          {/* COLONNE DROITE : Résultats et Historique */}
          <div className="space-y-8">
            
            {/* 3. DOCUMENTS GÉNÉRÉS & FICHE OFFICIELLE */}
            <section className="bg-gradient-to-br from-green-700 to-green-800 rounded-xl shadow-lg text-white overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-white/20 rounded-lg mr-3 shadow-inner">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="font-bold text-lg">Documents de sortie</h2>
                </div>

                <div className="space-y-6">
                  {/* SOUS-SECTION A: FICHE DE SYNTHÈSE (Condition: après validation Doyen) */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-green-300 uppercase tracking-widest flex items-center">
                      <FileText className="h-3 w-3 mr-1" /> Archive Administrative
                    </h3>
                    
                    {['validee_doyen', 'terminee'].includes(demande.status) ? (
                      <button
                        onClick={() => handleDownload()} 
                        className="w-full py-3 px-4 bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 rounded-lg transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center text-sm">
                          <FileText className="h-4 w-4 text-green-300 mr-3" />
                          <span className="font-medium text-green-50">Fiche de demande #{demande.id}</span>
                        </div>
                        <Download className="h-4 w-4 text-green-400 group-hover:translate-y-0.5 transition-transform" />
                      </button>
                    ) : (
                      <div className="p-3 bg-black/10 border border-dashed border-white/10 rounded-lg flex items-center gap-3">
                        <Clock className="h-4 w-4 text-green-500/50" />
                        <span className="text-[11px] text-green-200/70 italic text-left leading-tight">
                          La fiche de demande sera générée après la validation finale du Doyen.
                        </span>
                      </div>
                    )}
                  </div>

                  <hr className="border-green-600/50 shadow-sm" />

                  {/* SOUS-SECTION B: DOCUMENTS ACADÉMIQUES (Condition: Terminé OU Doyen) */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-green-300 uppercase tracking-widest flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" /> Documents Académiques
                    </h3>

                    {(demande.status === 'terminee' || user?.role !== 'etudiant') ? (
                      <div className="space-y-2">
                        {demande.documents && demande.documents
                          .filter(doc => doc.type !== 'autre')
                          .map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => handleDownloadFile(doc.id, doc.type)}
                            className="w-full py-3 px-4 bg-white text-green-900 font-bold rounded-lg shadow-md hover:bg-green-50 transition-all flex items-center justify-between group border-l-4 border-green-400"
                          >
                            <div className="flex items-center text-sm overflow-hidden">
                              <div className="p-1.5 bg-green-100 rounded mr-3 text-green-700">
                                <ShieldCheck className="h-4 w-4" />
                              </div>
                              <span className="truncate">
                                {DocumentTypeLabels[doc.type as keyof typeof DocumentTypeLabels] || doc.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Petit indicateur pour le Doyen s'il consulte avant la fin */}
                              {user?.role === 'doyen' && demande.status !== 'terminee' && (
                                <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">Brouillon</span>
                              )}
                              <Download className="h-4 w-4 text-green-600 shrink-0" />
                            </div>
                          </button>
                        ))}
                        
                        {(!demande.documents || demande.documents.filter(doc => doc.type !== 'autre').length === 0) && (
                          <p className="text-[11px] text-green-200/50 italic p-2 text-center">Aucun document n'a été rattaché pour le moment.</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-black/20 border border-white/5 rounded-xl p-6 text-center shadow-inner">
                        <Clock className="h-8 w-8 text-green-400/30 mx-auto mb-2" />
                        <p className="text-[11px] text-green-100/60 leading-relaxed px-2">
                          Les documents officiels (relevés, attestations) sont en cours de certification.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 4. HISTORIQUE DE VALIDATION (TIMELINE) */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Suivi du dossier</h3>
              </div>
              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {validations.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4 italic font-light">En attente de traitement...</p>
                    )}
                    {validations.map((val, idx) => (
                      <li key={val.id}>
                        <div className="relative pb-8">
                          {idx !== validations.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100" />
                          )}
                          <div className="relative flex space-x-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${
                              val.action === 'valider' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {val.action === 'valider' 
                                ? <CheckCircle className="h-5 w-5 text-green-600" /> 
                                : <ShieldCheck className="h-5 w-5 text-red-600" />
                              }
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <p className="text-sm font-bold text-gray-900 uppercase">{val.validator_role}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {new Date(val.validation_date).toLocaleDateString()} à {new Date(val.validation_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                              </div>
                              {val.comment && (
                                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-gray-200">
                                  {val.comment}
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
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandeDetails;