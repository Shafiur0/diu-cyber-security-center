import { BadgeTier } from '@csc-diu/shared-types';

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getBadgeDetails(tier: BadgeTier | null | undefined): {
  label: string;
  color: string;
  glow: string;
} {
  switch (tier) {
    case 'PLATINUM':
      return {
        label: 'Platinum',
        color: '#E5E4E2',
        glow: 'shadow-[0_0_15px_rgba(229,228,226,0.5)] border-[#E5E4E2]/30',
      };
    case 'GOLD':
      return {
        label: 'Gold',
        color: '#FFD700',
        glow: 'shadow-[0_0_15px_rgba(255,215,0,0.5)] border-[#FFD700]/30 animate-pulse',
      };
    case 'SILVER':
      return {
        label: 'Silver',
        color: '#C0C0C0',
        glow: 'shadow-[0_0_12px_rgba(192,192,192,0.4)] border-[#C0C0C0]/30',
      };
    case 'BRONZE':
    default:
      return {
        label: 'Bronze',
        color: '#CD7F32',
        glow: 'shadow-[0_0_8px_rgba(205,127,50,0.3)] border-[#CD7F32]/30',
      };
  }
}
