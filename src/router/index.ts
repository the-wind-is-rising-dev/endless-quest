import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";

// 路由
export const routes = [
  {
    path: "/common",
    name: "Common",
    alias: "/",
    component: import("../page/common/common.vue"),
    title: "常用工具",
    children: [
      {
        path: "json",
        name: "Json",
        component: import("../page/common/json.vue"),
        title: "JSON 工具",
      },
      {
        path: "base64",
        name: "Base64",
        component: import("../page/common/base64.vue"),
        title: "Base64 编解码",
      },
      {
        path: "urlcodec",
        name: "UrlCodec",
        component: import("../page/common/urlcodec.vue"),
        title: "URL 编解码",
      },
      {
        path: "timestamp",
        name: "timestamp",
        component: import("../page/common/timestamp.vue"),
        title: "时间戳转换器",
      },
      {
        path: "regex",
        name: "regex",
        component: import("../page/common/regex.vue"),
        title: "正则表达式助手",
      },
    ],
  },
  {
    path: "/algorithm",
    name: "Algorithm",
    component: import("../page/algorithm/algorithm.vue"),
    title: "算法工具",
    children: [
      {
        path: "md5",
        name: "MD5",
        component: import("../page/algorithm/md5.vue"),
        title: "MD5 摘要",
      },
      {
        path: "sha-1",
        name: "SHA-1",
        component: import("../page/algorithm/sha1.vue"),
        title: "SHA-1 摘要",
      },
      {
        path: "sha-256",
        name: "SHA-256",
        component: import("../page/algorithm/sha256.vue"),
        title: "SHA-256 摘要",
      },
    ],
  },
  {
    path: "/naming",
    name: "Naming",
    component: import("../page/naming/naming.vue"),
    title: "起名工具",
    children: [
      {
        path: "baby",
        name: "Baby",
        component: import("../page/naming/baby.vue"),
        title: "宝宝起名",
      },
      {
        path: "company",
        name: "Company",
        component: import("../page/naming/company.vue"),
        title: "公司起名",
      },
      {
        path: "software",
        name: "Software",
        component: import("../page/naming/software.vue"),
        title: "软件起名",
      },
      {
        path: "custom",
        name: "Custom",
        component: import("../page/naming/custom.vue"),
        title: "自定义类型起名",
      },
    ],
  },
];

export const router = createRouter({
  history:
    process.env.NODE_ENV === "github-io"
      ? createWebHashHistory("/endless-quest/")
      : createWebHistory(),
  routes,
});

/**
 * 全局前置路由守卫，每一次路由跳转前都进入这个 beforeEach 函数，无 token 时跳转至登录页
 * 参考：https://juejin.cn/post/7106867857685741604
 */
router.beforeEach((to, _from, next) => {
  console.log("to: ", to.path);
  next();
});

export default router;
