/**
 * Hook centralisé pour la gestion des plans Yitewo
 * Utilisé dans tout le portail partenaire
 */

export type Plan = 'free' | 'pro' | 'business' | 'enterprise';

const PLAN_ORDER: Record<Plan, number> = {
  free: 0, pro: 1, business: 2, enterprise: 3,
};

export function usePlan(currentPlan: Plan | string = 'free') {
  const plan = (currentPlan as Plan) || 'free';
  const level = PLAN_ORDER[plan] ?? 0;

  return {
    plan,
    isFree: level === 0,
    isPro: level >= 1,
    isBusiness: level >= 2,
    isEnterprise: level >= 3,

    // Limites
    maxProducts: level === 0 ? 5 : 999999,
    maxPhotos: level === 0 ? 1 : level === 1 ? 5 : 10,
    maxSites: level <= 1 ? 1 : level === 2 ? 3 : 999,

    // Features
    canSeeStats: level >= 1,
    canSeeMonthlyReport: level >= 2,
    hasWhatsAppAgent: level >= 2,
    hasPrioritySupport: level >= 2,
    hasPushNotifications: level >= 2,
    isHighlighted: level >= 1,   // apparaît en tête dans les résultats
    isPinned: level >= 2,   // épinglé tout en tête

    // Badge visible sur la carte publique
    badge: plan === 'enterprise' ? '🏢 Enterprise'
      : plan === 'business' ? '⭐ Business'
        : plan === 'pro' ? '✓ Pro'
          : null,

    badgeColor: plan === 'enterprise' ? '#6366f1'
      : plan === 'business' ? '#1A9E5F'
        : plan === 'pro' ? '#E8380D'
          : null,

    // Prochain plan à suggérer
    upgradeTo: plan === 'free' ? 'pro'
      : plan === 'pro' ? 'business'
        : plan === 'business' ? 'enterprise'
          : null,

    upgradePrice: plan === 'free' ? '4 900 FCFA/mois'
      : plan === 'pro' ? '14 900 FCFA/mois'
        : plan === 'business' ? 'Sur devis'
          : null,
  };
}
