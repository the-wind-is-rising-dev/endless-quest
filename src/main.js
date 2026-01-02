import { createApp } from "vue";
import Antd from "ant-design-vue";
import "./themes/index.css";
import App from "./App.vue";
import router from "./router/index.ts";

createApp(App).use(Antd).use(router).mount("#app");
