/**
 * 参考：https://juejin.cn/post/7023567066045087780
 * https://juejin.cn/post/7091589052868067365
 */
import axios from "axios";
import { message } from "ant-design-vue";
import { nextTick } from "vue";

export const baseURL = "";
// console.log("import.meta.env:", import.meta.env);
axios.defaults.baseURL = baseURL && baseURL != "" ? baseURL : undefined;
axios.defaults.timeout = 5000;
// 表示跨域请求时是否需要使用凭证
axios.defaults.withCredentials = false;
// axios.defaults.headers.common['token'] =  AUTH_TOKEN
axios.defaults.headers.post["Content-Type"] = "application/json;charset=UTF-8";
// 允许跨域
axios.defaults.headers.post["Access-Control-Allow-Origin-Type"] = "*";

// 请求拦截器
axios.interceptors.request.use(
  (config) => config,
  (error) => {
    message.error(error.data.error.message);
    return Promise.reject(error.data.error.message);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  (config) => Promise.resolve(config.data),
  function (error) {
    console.log("请求错误：", error);
    if (error.response?.status) {
      switch (error.response.status) {
        // 401: 未登录
        // 未登录则跳转登录页面，并携带当前页面的路径
        // 在登录成功后返回当前页面，这一步需要在登录页操作。
        case 401: //重定向
          message.error("token:登录失效==>" + error.response.status);
          break;
        // 403 token过期
        // 登录过期对用户进行提示
        // 清除本地token和清空vuex中token对象
        // 跳转登录页面
        case 403:
          message.error(
            "用户得到授权，但是访问是被禁止的==>" + error.response.status
          );
          break;
        case 404:
          message.error("网络请求不存在==>" + error.response.status);
          break;
        case 406:
          message.error("请求的格式不可得==>" + error.response.status);
          break;
        case 410:
          message.error(
            "请求的资源被永久删除，且不会再得到的==>" + error.response.status
          );
          break;
        case 422:
          message.error(
            "当创建一个对象时，发生一个验证错误==>" + error.response.status
          );
          break;
        case 500:
          message.error(
            "服务器发生错误，请检查服务器==>" + error.response.status
          );
          break;
        case 502:
          message.error("网关错误==>" + error.response.status);
          break;
        case 503:
          message.error(
            "服务不可用，服务器暂时过载或维护==>" + error.response.status
          );
          break;
        case 504:
          message.error("网关超时==>" + error.response.status);
          break;
        default:
          message.error("其他错误错误==>" + error.response.status);
      }
      return Promise.reject(error.response);
    } else {
      message.error("请求异常");
      return Promise.reject(error);
    }
  }
);
var isShowLoading = true;
export const post = (
  url: string,
  data: any,
  headers = {},
  isLoading = true
): Promise<any> => {
  if (isShowLoading && isLoading) {
    isShowLoading = false;
    message.loading("加载中", 0.5);
    setTimeout(() => {
      isShowLoading = true;
    }, 1500);
  }
  return axios.post(url, data, {
    headers: { ...headers },
  });
};
export const get = (
  url: string,
  headers = {},
  isLoading = false
): Promise<any> => {
  if (isShowLoading && isLoading) {
    isShowLoading = false;
    message.loading("加载中", 0.5);
    setTimeout(() => {
      isShowLoading = true;
    }, 1500);
  }
  return axios.get(url, { headers: { ...headers } });
};
/**
 * 下载文件
 * @param url
 * @param fileName
 * @param data
 * @param headers
 */
export const postDownLoad = (
  url: string,
  fileName: string,
  data: any,
  headers = {}
) => {
  post(url, data, headers).then((response) => {
    console.log(`下载文件：fileName=${fileName}url=${url}`);
    //此处返回的blob对象
    var fileURL = window.URL.createObjectURL(new Blob([response]));
    var fileLink = document.createElement("a");
    fileLink.href = fileURL;
    fileLink.setAttribute("download", fileName);
    document.body.appendChild(fileLink);
    fileLink.click();
  });
};
/**
 * 下载文件
 * @param url
 * @param fileName
 * @param data
 * @param headers
 */
export const getDownLoad = (url: string, fileName: string, headers = {}) => {
  get(url, headers).then((response) => {
    console.log(`下载文件：fileName=${fileName}url=${url}`);
    //此处返回的blob对象
    var fileURL = window.URL.createObjectURL(new Blob([response]));
    var fileLink = document.createElement("a");
    fileLink.href = fileURL;
    fileLink.setAttribute("download", fileName);
    document.body.appendChild(fileLink);
    fileLink.click();
  });
};

export interface ProcessStreamCallback {
  (done: boolean, reason: string, content: string): void;
}
export function postStream(
  url: string,
  body: any,
  processStreamCallback: ProcessStreamCallback
): Promise<any> {
  return new Promise((resolve, reject) => {
    const headers: Headers = new Headers();
    headers.set("Content-Type", "application/json");
    url = url.match(/^http(s)?:\/\//) ? url : baseURL + url;
    fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    })
      .then((response: any) => {
        // 检查响应的状态码是否表示请求成功（通常状态码在200 - 299之间表示成功）
        if (!response.ok) {
          reject(`请求失败，状态码：${response.status}`);
          return;
        }
        // 检查响应是否有实际的主体内容
        if (!response.body) {
          reject(`请求失败，状态码：${response.status}`);
          return;
        }
        // 创建一个用于读取响应流中数据块的读取器对象reader
        // response.body?.getReader()是获取可读取流的读取器，这里的any类型声明可能是因为缺少更精确的类型定义
        const reader: any = response.body?.getReader();
        // 创建一个TextDecoder对象decoder，用于将读取到的二进制数据解码为文本数据
        const decoder = new TextDecoder();
        const reasonList: string[] = [];
        const contentList: string[] = [];
        const byteBuffer = new Uint8Array(2048);
        var byteIndex = 0;
        var lines = 0;
        // 定义一个函数processTextStream，用于处理每次读取到的数据流数据块
        const processTextStream = ({
          done,
          value,
        }: ReadableStreamReadResult<Uint8Array>) => {
          // 刷新页面
          nextTick();
          // 当done为true时，表示数据流已经读取完毕
          const buffer = value;
          for (let idx = 0; buffer && idx < buffer.byteLength; idx++) {
            const charCode = buffer[idx];
            byteBuffer[byteIndex] = charCode;
            byteIndex = byteIndex + 1;
            if (charCode === 10) {
              lines = lines + 1;
            }
            if (lines > 1) {
              if (byteIndex > 100) {
                const delta = JSON.parse(
                  decoder.decode(byteBuffer.slice(6, byteIndex), {
                    stream: true,
                  })
                )["choices"][0]["delta"];
                var reasoning_content = delta["reasoning_content"];
                var content = delta["content"];
                reasonList.push(reasoning_content ? reasoning_content : "");
                contentList.push(content ? content : "");
                processStreamCallback(
                  done,
                  reasoning_content ? reasoning_content : "",
                  content ? content : ""
                );
              }
              lines = 0;
              byteIndex = 0;
            }
          }
          if (done) {
            processStreamCallback(done, "", "");
            console.log("Stream complete");
            resolve({ reasonList, contentList });
            return;
          }
          // 继续读取下一个数据块
          return reader.read().then(processTextStream);
        };

        // 开始读取数据流，每次读取到一个数据块后就会调用processTextStream函数进行处理
        // 并且通过链式调用的方式不断读取下一个数据块，直到数据流读取完毕
        return reader.read().then(processTextStream);
      })
      // 捕获在整个请求处理过程中（包括发送请求、处理响应等环节）出现的任何错误
      // 并将错误信息输出到控制台
      .catch((error) => reject(error));
  });
}
export default axios;
