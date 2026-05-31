export const PLANS = {
  starter: {
    name: "Starter",
    monthly: 50000,
    annual: 500000,
    limits: { activeListings: 50, teamMembers: 1, apiAccess: false, whiteLabel: false },
    features: ["50 active listings", "Campaign pages", "Lead capture", "Basic analytics", "Multi-channel sharing"]
  },
  professional: {
    name: "Professional",
    monthly: 100000,
    annual: 1000000,
    limits: { activeListings: 500, teamMembers: 10, apiAccess: false, whiteLabel: false },
    features: ["500 active listings", "Advanced analytics", "Team access", "Marketing reports", "Priority support"]
  },
  enterprise: {
    name: "Enterprise",
    monthly: 250000,
    annual: 2500000,
    limits: { activeListings: 999999, teamMembers: 999999, apiAccess: true, whiteLabel: true },
    features: ["Unlimited listings", "Unlimited team members", "White-label access", "API access", "Dedicated support"]
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
