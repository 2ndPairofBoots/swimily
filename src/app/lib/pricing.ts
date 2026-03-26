export const PRICING = {
  monthly: {
    price: 4.99,
    displayPrice: '$4.99',
    interval: 'month',
    stripeProductId: 'price_monthly_4_99',
  },
  annual: {
    price: 49.99,
    displayPrice: '$49.99',
    interval: 'year',
    savings: '17%',
    savingsAmount: 9.89,
    stripeProductId: 'price_annual_49_99',
  },
} as const;

export const PREMIUM_FEATURES = [
  'Unlimited AI workout generation',
  'Advanced analytics & insights',
  'Photo workout scanning',
  'Race split predictions',
  'SWOLF & efficiency tracking',
  'Unlimited cloud storage',
  'Priority support',
  'Ad-free experience',
] as const;

export function calculateAnnualSavings(): string {
  const monthlyYearlyCost = PRICING.monthly.price * 12;
  const annualCost = PRICING.annual.price;
  const savings = monthlyYearlyCost - annualCost;
  const savingsPercent = Math.round((savings / monthlyYearlyCost) * 100);
  return `${savingsPercent}%`;
}

export function getAnnualSavingsAmount(): number {
  const monthlyYearlyCost = PRICING.monthly.price * 12;
  const annualCost = PRICING.annual.price;
  return Number((monthlyYearlyCost - annualCost).toFixed(2));
}
