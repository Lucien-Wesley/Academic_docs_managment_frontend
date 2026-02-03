// src/types/documentTypes.ts

export enum DocumentType {
  RELEVE_NOTES_L0 = 'releve_notes_l0',
  RELEVE_NOTES_L1 = 'releve_notes_l1',
  RELEVE_NOTES_L2 = 'releve_notes_l2',
  RELEVE_NOTES_L3 = 'releve_notes_l3',
  RELEVE_NOTES_M1 = 'releve_notes_m1',
  RELEVE_NOTES_M2 = 'releve_notes_m2',

  ATTESTATION_REUSSITE_L0 = 'attestation_reussite_l0',
  ATTESTATION_REUSSITE_L1 = 'attestation_reussite_l1',
  ATTESTATION_REUSSITE_L2 = 'attestation_reussite_l2',
  ATTESTATION_REUSSITE_L3 = 'attestation_reussite_l3',
  ATTESTATION_REUSSITE_M1 = 'attestation_reussite_m1',
  ATTESTATION_REUSSITE_M2 = 'attestation_reussite_m2',
  ATTESTATION_FREQUENTATION = 'attestation_frequentation',

  DIPLOME_LICENCE = 'diplome_licence',
  DIPLOME_MASTER = 'diplome_master',

  AUTRE = 'autre'
}

// Mapping pour l'affichage utilisateur (Label lisible)
export const DocumentTypeLabels: Record<DocumentType, string> = {
  [DocumentType.RELEVE_NOTES_L0]: 'Relevé de notes L0',
  [DocumentType.RELEVE_NOTES_L1]: 'Relevé de notes L1',
  [DocumentType.RELEVE_NOTES_L2]: 'Relevé de notes L2',
  [DocumentType.RELEVE_NOTES_L3]: 'Relevé de notes L3',
  [DocumentType.RELEVE_NOTES_M1]: 'Relevé de notes M1',
  [DocumentType.RELEVE_NOTES_M2]: 'Relevé de notes M2',
  [DocumentType.ATTESTATION_REUSSITE_L0]: 'Attestation de réussite L0',
  [DocumentType.ATTESTATION_REUSSITE_L1]: 'Attestation de réussite L1',
  [DocumentType.ATTESTATION_REUSSITE_L2]: 'Attestation de réussite L2',
  [DocumentType.ATTESTATION_REUSSITE_L3]: 'Attestation de réussite L3',
  [DocumentType.ATTESTATION_REUSSITE_M1]: 'Attestation de réussite M1',
  [DocumentType.ATTESTATION_REUSSITE_M2]: 'Attestation de réussite M2',
  [DocumentType.ATTESTATION_FREQUENTATION]: 'Attestation de Fréquentation',
  [DocumentType.DIPLOME_LICENCE]: 'Diplôme de Licence',
  [DocumentType.DIPLOME_MASTER]: 'Diplôme de Master',
  [DocumentType.AUTRE]: 'Autre',
};