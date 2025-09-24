export interface DailyDetails {
  solarDate: string;
  lunarDate: {
    day: number;
    month: number;
    year: number;
    isLeapMonth: boolean;
  };
  dayCanChi: string;
  monthCanChi: string;
  yearCanChi: string;
  solarTerm: string;
  dayOfficer: string;
  auspiciousHours: string[];
  inauspiciousHours: string[];
  goodStars: string[];
  badStars: string[];
  shouldDo: string[];
  shouldNotDo: string[];
}

export interface ConvertedDateResult {
  year: number;
  month: number;
  day: number;
  canChi?: string;
}

export interface LunarDayInfo {
  solarDay: number;
  lunarDay: number;
  lunarMonth: number;
  isHoliday: boolean; // For major Vietnamese holidays
  isGoodDay: boolean; // Generally auspicious day
}

export type LunarMonthData = LunarDayInfo[];
