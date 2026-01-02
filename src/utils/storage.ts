import DateUtils from "./DateUtils";

class Storage {
  /**
   *
   * @param key
   * @param value
   * @param timeout 数据过期时间,单位：ms（毫秒）
   */
  public set(key: string, value: any, timeout?: number) {
    localStorage.setItem(
      key,
      JSON.stringify({
        value: value,
        timeout: timeout,
        datetime: DateUtils.timestamp(),
      })
    );
  }

  public get(key: string) {
    var data = localStorage.getItem(key);
    if (!data) return data;
    var obj;
    try {
      obj = JSON.parse(data);
    } catch {
      return data;
    }
    const now = DateUtils.timestamp();
    if (obj.datetime && now > obj.datetime + obj.timeout) {
      return null;
    }
    return obj.value;
  }

  public remove(key: string) {
    localStorage.removeItem(key);
  }
}

export const storage = new Storage();

export default storage;
