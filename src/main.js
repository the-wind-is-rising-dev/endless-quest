import { createApp } from "vue";
import Antd from "ant-design-vue";
import "./themes/index.css";
import App from "./App.vue";
import router from "./router/index.ts";
// 导入 vue-color 的样式文件
import "vue-color/style.css";

createApp(App).use(Antd).use(router).mount("#app");
