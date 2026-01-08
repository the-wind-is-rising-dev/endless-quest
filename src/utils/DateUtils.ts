class DateTimeUtils {
  /**
   * 获取当前时间戳 or 指定时间戳
   * @param now
   * @returns
   */
  public timestamp(now?: Date) {
    now = now ? now : new Date();
    return Date.parse(now.toString());
  }
  /**
   * 格式化日期
   */
  public formatDateTime(
    date: Date,
    pattern: string = "YYYY-MM-DD HH:mm:ss"
  ): string {
    const map: { [key: string]: number } = {
      YYYY: date.getFullYear(),
      MM: date.getMonth() + 1,
      DD: date.getDate(),
      HH: date.getHours(),
      mm: date.getMinutes(),
      ss: date.getSeconds(),
    };

    return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => {
      const value = map[match];
      return value != undefined ? String(value).padStart(2, "0") : match;
    });
  }

  public parseDateTime(dateTimeStr: string): Date {
    if (!dateTimeStr) {
      throw new Error("Date string is empty");
    }

    // 验证格式
    const formatRegex = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/;
    if (!formatRegex.test(dateTimeStr)) {
      throw new Error(
        `Invalid date format: ${dateTimeStr}. Expected format: YYYY-MM-DD HH:MM:SS`
      );
    }

    try {
      // 替换空格为 T 以符合 ISO 8601 格式
      const isoString = dateTimeStr.replace(" ", "T");
      const date = new Date(isoString);

      // 验证日期是否有效
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date values");
      }

      return date;
    } catch (error) {
      throw new Error(`Error parsing date: ${error}`);
    }
  }

  public getChineseWeekday(date: Date): string {
    const weekdays = [
      "星期日",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
    ];
    return weekdays[date.getDay()];
  }

  public plusDay(date: Date, days: number) {
    var timestamp = Date.parse(date.toString()); //转换为时间戳
    timestamp += 86400 * 1000 * days; //修改后的时间戳
    return new Date(timestamp); //转换为时间
  }
}

export const DateUtils = new DateTimeUtils();
export default DateUtils;
