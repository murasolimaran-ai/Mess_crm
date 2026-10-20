import { CouncilCategory } from '../types';

/**
 * Calculates late payment fine according to the Mess Council Fine Rules:
 * - 1st to 15th: Grace window -> ₹0
 * - 16th to 22nd (First 7 late days): ₹25/day
 * - 23rd onward (Day 8+): ₹50/day through month-end
 * - Month-end: Fine calculation stops and freezes for that cycle
 *
 * @param dayOfMonth Current day of month (1-31)
 * @param hasUnpaidCurrentBill Whether the student has outstanding unpaid charges
 */
export function calculateLateFine(dayOfMonth: number, hasUnpaidCurrentBill: boolean): {
  fineAmount: number;
  lateDays: number;
  fineStatusLabel: string;
} {
  if (!hasUnpaidCurrentBill || dayOfMonth <= 15) {
    return {
      fineAmount: 0,
      lateDays: 0,
      fineStatusLabel: 'Within Grace Period (No Fine)',
    };
  }

  const lateDays = dayOfMonth - 15;

  if (lateDays <= 7) {
    // Days 16 through 22 (Tier 1: ₹25/day)
    const fineAmount = lateDays * 25;
    return {
      fineAmount,
      lateDays,
      fineStatusLabel: `${lateDays} late day(s) @ ₹25/day`,
    };
  } else {
    // Day 23 onward (Tier 2: First 7 days @ ₹25 + subsequent days @ ₹50)
    const tier1Fine = 7 * 25; // ₹175
    const tier2Days = lateDays - 7;
    const tier2Fine = tier2Days * 50;
    const fineAmount = tier1Fine + tier2Fine;
    return {
      fineAmount,
      lateDays,
      fineStatusLabel: `7 days @ ₹25 + ${tier2Days} day(s) @ ₹50/day`,
    };
  }
}

/**
 * Determines Council Payment Status Category (A, B, C, D)
 * 
 * Category A — Fully settled: Current bill + previous pending dues + applicable fine all paid. Balance = 0.
 * Category B — Current bill paid only: Current bill paid, but previous dues and/or fine remain.
 * Category C — Bill and fine paid; old dues remain: Current bill and fine paid, but previous pending principal remains.
 * Category D — Other / partial / no payment: Payment pattern does not match A-C.
 */
export function determineCouncilCategory(params: {
  currentBill: number;
  previousDues: number;
  fine: number;
  amountPaid: number;
}): CouncilCategory {
  const { currentBill, previousDues, fine, amountPaid } = params;
  const totalDue = currentBill + previousDues + fine;

  if (amountPaid >= totalDue && totalDue > 0) {
    return 'A'; // Fully settled
  }

  if (totalDue === 0) {
    return 'A';
  }

  const hasPaidCurrent = amountPaid >= currentBill && currentBill > 0;
  const hasPaidCurrentAndFine = amountPaid >= (currentBill + fine) && (currentBill + fine) > 0;

  if (hasPaidCurrentAndFine && previousDues > 0) {
    return 'C'; // Bill and fine paid; old dues remain
  }

  if (hasPaidCurrent && (previousDues > 0 || fine > 0)) {
    return 'B'; // Current bill paid only
  }

  return 'D'; // Partial or no payment
}

export function getCouncilCategoryBadge(category: CouncilCategory): {
  label: string;
  badgeClass: string;
  description: string;
} {
  switch (category) {
    case 'A':
      return {
        label: 'Category A: Fully Settled',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        description: 'All current bill, prior arrears, and fines paid in full (Balance = ₹0).',
      };
    case 'B':
      return {
        label: 'Category B: Current Bill Only',
        badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
        description: 'Current month extras settled, but previous arrears or late fines remain.',
      };
    case 'C':
      return {
        label: 'Category C: Bill + Fine Paid (Old Dues)',
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
        description: 'Current extras and fine cleared; historic principal arrears pending.',
      };
    case 'D':
    default:
      return {
        label: 'Category D: Partial / Unpaid',
        badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
        description: 'Partial token payment or overdue balance outstanding.',
      };
  }
}
