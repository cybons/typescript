import { start } from 'repl';
import { DateManager } from './date-manager';

export class WorkdayScheduler {
  private dateManager: DateManager;

  constructor(dateManager: DateManager) {
    this.dateManager = dateManager;
  }

  public getMonthlyDaysOfWorkdays(day: number, startDate: Date, endDate: Date): Date[] {
    const days: Date[] = [];
    const currentDate = startDate;

    while (currentDate <= endDate) {
      if (currentDate.getDate() === day) {
        let nearestWorkday = new Date(currentDate);

        // 稼働日でない場合、最も近い稼働日を探す
        while (this.dateManager.isHoliday(nearestWorkday) && nearestWorkday <= endDate) {
          nearestWorkday.setDate(nearestWorkday.getDate() + 1);
        }

        // 稼働日が期間内であれば追加
        if (nearestWorkday <= endDate) {
          days.push(nearestWorkday);
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
    // ...
  }

  public getMonthlyLastWorkdays(startDate: Date, endDate: Date): Date[] {
    // ...
    return [new Date()];
  }

  public getNthWeekdayWorkdays(
    startDate: Date,
    endDate: Date,
    nthWeek: number,
    dayOfWeek: number,
    skipNonWorkdays: boolean = false
  ): Date[] {
    // ...
    return [new Date()];
  }

  public getWeeklyWorkdays(
    startDate: Date,
    endDate: Date,
    dayOfWeek: number,
    skipNonWorkdays: boolean = false
  ): Date[] {
    // ...
    return [new Date()];
  }
}
