import { Airman, Rank } from '../types';

export const RANK_SENIORITY: Record<Rank, number> = {
  SWO: 1,
  WO: 2,
  Sgt: 3,
  Cpl: 4,
  LAC: 5,
};

/**
 * Sorts airmen strictly according to Bangladesh Air Force Seniority:
 * 1. Rank (SWO > WO > Sgt > Cpl > LAC)
 * 2. BD Number (Lower BD No = more senior)
 * 3. Serial Number
 */
export function sortAirmenBySeniority(airmen: Airman[]): Airman[] {
  return [...airmen].sort((a, b) => {
    const rankA = RANK_SENIORITY[a.rank] || 99;
    const rankB = RANK_SENIORITY[b.rank] || 99;
    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // Extract numbers from BD No (e.g. BD/468582 -> 468582)
    const numA = parseInt(a.bdNo.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.bdNo.replace(/\D/g, ''), 10) || 0;
    if (numA !== numB) {
      return numA - numB;
    }

    return (a.serNo || 0) - (b.serNo || 0);
  });
}
