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
  public formatDateTime(date: Date, format: string) {
    const o: any = {
      "M+": date.getMonth() + 1, // 月份
      "d+": date.getDate(), // 日
      "h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 小时
      "H+": date.getHours(), // 小时
      "m+": date.getMinutes(), // 分
      "s+": date.getSeconds(), // 秒
      "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
      S: date.getMilliseconds(), // 毫秒
      a: date.getHours() < 12 ? "上午" : "下午", // 上午/下午
      A: date.getHours() < 12 ? "AM" : "PM", // AM/PM
    };
    if (/(y+)/.test(format)) {
      format = format.replace(
        RegExp.$1,
        (date.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
    for (const k in o) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? o[k]
            : ("00" + o[k]).substr(("" + o[k]).length)
        );
      }
    }
    return format;
  }

  public plusDay(date: Date, days: number) {
    var timestamp = Date.parse(date.toString()); //转换为时间戳
    timestamp += 86400 * 1000 * days; //修改后的时间戳
    return new Date(timestamp); //转换为时间
  }
}

export const DateUtils = new DateTimeUtils();
export default DateUtils;
