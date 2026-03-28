/**
 * Traductions des valeurs backend (anglais) → affichage UI (français).
 */

const activityStatusLabels: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publiée',
  active: 'Active',
  full: 'Complète',
  cancelled: 'Annulée',
  completed: 'Terminée',
};

const activityTypeLabels: Record<string, string> = {
  real: 'Réel',
  visio: 'Visio',
};

const genderRestrictionLabels: Record<string, string> = {
  all: 'Tout le monde',
  girls_only: 'Filles uniquement',
  female: 'Filles uniquement',
  male: 'Garçons uniquement',
};

const visibilityLabels: Record<string, string> = {
  public: 'Publique',
  friends: 'Amis',
  invite: 'Sur invitation',
  private: 'Privée',
};

const validationTypeLabels: Record<string, string> = {
  auto: 'Automatique',
  automatic: 'Automatique',
  manual: 'Manuelle',
};

const userTypeLabels: Record<string, string> = {
  person: 'Particulier',
  pro: 'Pro',
  asso: 'Association',
};

const participationStatusLabels: Record<string, string> = {
  pending: 'En attente',
  validated: 'Validée',
  rejected: 'Refusée',
  cancelled: 'Annulée',
};

function translate(labels: Record<string, string>, value: string | null | undefined): string {
  if (!value) return '—';
  return labels[value] ?? value;
}

export const t = {
  activityStatus: (v: string | null | undefined) => translate(activityStatusLabels, v),
  activityType: (v: string | null | undefined) => translate(activityTypeLabels, v),
  genderRestriction: (v: string | null | undefined) => translate(genderRestrictionLabels, v),
  visibility: (v: string | null | undefined) => translate(visibilityLabels, v),
  validationType: (v: string | null | undefined) => translate(validationTypeLabels, v),
  userType: (v: string | null | undefined) => translate(userTypeLabels, v),
  participationStatus: (v: string | null | undefined) => translate(participationStatusLabels, v),
};
