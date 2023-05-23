import { formatDate } from '../html-util';
import { WorkdayScheduler } from './workday-scheduler';

export type DateOrPeriod = string | { start: string; end: string };

export interface HolidaySettings {
  holidays: DateOrPeriod[];
  companyHolidays: DateOrPeriod[];
  companyWorkdays: DateOrPeriod[];
  regularDaysOff?: number[]; // オプショナルに変更
}

export class DateManager {
  private holidaySettings: HolidaySettings;

  constructor(holidaySettings: HolidaySettings) {
    this.holidaySettings = {
      ...holidaySettings,
      regularDaysOff: holidaySettings.regularDaysOff || [0, 6], // デフォルト値を設定
    };
  }

  /**
   * 日付が期間内にあるかどうかを判定します。
   * @param {Date} date - 判定する日付
   * @param {DatePeriod} period - 期間
   * @returns {boolean} - 期間内であれば true、そうでなければ false
   */
  private isDateWithinPeriod(date: Date, period: DateOrPeriod): boolean {
    if (typeof period === 'string') {
      return formatDate(date, 'yyyy-MM-dd') === period;
    }
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const comparisonDate = new Date(date);
    comparisonDate.setHours(0, 0, 0, 0);

    return comparisonDate >= startDate && comparisonDate <= endDate;
  }

  /**
   * 日付が休日かどうかを判定します。
   * @param {Date} date - 判定する日付
   * @returns {boolean} - 休日であれば true、そうでなければ false
   */
  public isHoliday(date: Date): boolean {
    const { holidays, companyHolidays, companyWorkdays, regularDaysOff } = this.holidaySettings;
    const dayOfWeek = date.getDay();

    if (companyWorkdays.some(period => this.isDateWithinPeriod(date, period))) {
      return false;
    }

    if (regularDaysOff && regularDaysOff.includes(dayOfWeek)) {
      return true;
    }

    if (holidays.some(period => this.isDateWithinPeriod(date, period))) {
      return true;
    }

    if (companyHolidays.some(period => this.isDateWithinPeriod(date, period))) {
      return true;
    }

    return false;
  }

  /**
   * n 稼働日後または前の日付を計算します。
   * @param {number} n - 稼働日数。正の値であれば n 日後、負の値であれば n 日前を計算します。
   * @returns {Date} - 計算された日付
   */
  public calculateWorkday(date: Date, n: number): Date {
    const newDate = new Date(date);
    while (n !== 0) {
      newDate.setDate(newDate.getDate() + (n > 0 ? 1 : -1));
      if (!this.isHoliday(newDate)) {
        n = n > 0 ? n - 1 : n + 1;
      }
    }
    return newDate;
  }

  /**
   * 本日が引数の日付から何日経過しているかを算出します。
   * @param {Date} date - 比較する日付
   * @returns {number} - 経過日数
   */
  public daysSince(date: Date): number {
    const today = new Date();
    return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * 次の休日までの日数を算出します。
   * @returns {number} - 次の休日までの日数
   */
  public daysUntilNextHoliday(date: Date): number {
    let days = 0;
    let currentDate = new Date(date);
    while (!this.isHoliday(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
      days++;
    }
    return days;
  }

  /**
   * 前回の休日からの日数を算出します。
   * @returns {number} - 前回の休日からの日数
   */
  public daysSinceLastHoliday(date: Date): number {
    let days = 0;
    let currentDate = new Date(date);
    while (!this.isHoliday(currentDate)) {
      currentDate.setDate(currentDate.getDate() - 1);
      days++;
    }
    return days;
  }
  /**
   * 指定された日付から n 稼働日後または前の日付を計算します。
   * @param {Date} baseDate - 基準となる日付
   * @param {number} n - 稼働日数。正の値であれば n 日後、負の値であれば n 日前を計算します。
   * @returns {Date} - 計算された日付
   */
  public calculateWorkdayFromDate(baseDate: Date, n: number): Date {
    let date = new Date(baseDate);
    let workdays = 0;

    while (workdays !== n) {
      date.setDate(date.getDate() + (n > 0 ? 1 : -1));

      if (!this.isHoliday(date)) {
        workdays += n > 0 ? 1 : -1;
      }
    }

    return date;
  }
}
