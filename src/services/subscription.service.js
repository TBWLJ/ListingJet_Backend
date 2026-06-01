export const PLANS = {
  starter: {
    name: "Starter",
    monthly: 15000,
    annual: 150000,
    limits: { activeListings: 20, teamMembers: 1, apiAccess: false, whiteLabel: false },
    features: ["20 active listings", "Campaign pages", "Lead capture", "Analytics", "Marketing assets", "Multi-channel sharing"]
  },
  growth: {
    name: "Growth",
    monthly: 50000,
    annual: 500000,
    limits: { activeListings: 100, teamMembers: 5, apiAccess: false, whiteLabel: false },
    features: ["100 active listings", "Campaign Scheduler", "Marketing Asset Studio", "Advanced analytics", "Visibility Score", "Marketing Health Score", "Priority support"]
  },
  premium: {
    name: "Premium",
    monthly: 100000,
    annual: 1000000,
    limits: { activeListings: 500, teamMembers: 10, apiAccess: false, whiteLabel: false },
    features: ["500 active listings", "Everything in Growth", "Monthly custom flyer design", "Two promotional video ads monthly", "Campaign boost credits", "Priority distribution", "Premium support"]
  },
  enterprise: {
    name: "Enterprise",
    monthly: 250000,
    annual: 2500000,
    limits: { activeListings: 999999, teamMembers: 999999, apiAccess: true, whiteLabel: true },
    features: ["Unlimited listings", "White-label platform", "Custom domain support", "Dedicated account manager", "Dedicated marketing team", "API access", "Custom integrations"]
  }
};

export function getPlan(plan, billingCycle) {
  const selected = PLANS[plan];
  if (!selected) return null;
  return { ...selected, plan, billingCycle, amount: selected[billingCycle] };
}

export function periodEnd(billingCycle) {
  const end = new Date();
  end.setMonth(end.getMonth() + (billingCycle === "annual" ? 12 : 1));
  return end;
}
