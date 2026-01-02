// 存储主题配置的键
const THEME_STORAGE_KEY = "custom-theme";

// 主题
export interface Theme {
  name: string; // 主题名称
  className: string; // 对应的 CSS 类名
}

// 模式
export interface ThemeModel {
  name: string; // 模式名称
  followSystem: boolean; // 是否跟随系统
  value: "light" | "dark"; // 模式值
}

// 主题配置
export interface ThemeConfig {
  theme: Theme; // 主题
  model: ThemeModel; // 默认主题模式
}

/**
 * 检测当前系统是否启用暗黑模式
 */
function isDarkMode() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/**
 * 应用主题
 * @param themeConfig 主题配置
 */
function applyTheme(themeConfig: ThemeConfig) {
  const className = themeConfig.theme.className;
  const mode = themeConfig.model;

  // 移除旧的主题类
  const classes = document.documentElement.className.split(" ");
  const themeClasses = classes.filter(
    (c) => !c.includes("theme-") && c !== "dark"
  );
  document.documentElement.className = themeClasses.join(" ");

  // 添加新的主题类
  document.documentElement.classList.add(className);
  // 判断是否启用暗黑模式
  if (mode.value === "dark") {
    document.documentElement.classList.add("dark");
  }

  // 存储当前主题配置
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeConfig));
}

/**
 * 初始化主题
 */
export function initializeTheme() {
  // 获取当前主题配置并应用
  const themeConfig = getCurrentThemeConfig();
  // 初始化当前主题类型
  if (themeConfig.model.followSystem) {
    themeConfig.model.value = isDarkMode() ? "dark" : "light";
  }
  applyTheme(themeConfig);
}

/**
 * 获取当前主题配置
 * @returns 主题配置
 */
export function getCurrentThemeConfig(): ThemeConfig {
  let theme: any = localStorage.getItem(THEME_STORAGE_KEY);
  return theme
    ? JSON.parse(theme)
    : {
        theme: getThemeList()[0], // 默认主题
        model: {
          name: "跟随系统",
          followSystem: true,
          value: isDarkMode() ? "dark" : "light",
        },
      };
}

/**
 * 添加暗黑模式监听
 */
export function addDarkListener() {
  // 监听暗黑模式变化, auto 模式动态切换主题
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      const themeConfig = getCurrentThemeConfig();
      if (!themeConfig.model.followSystem) return;
      changeThemeMode(themeConfig.model);
    });
}

/**
 * 移除暗黑模式监听
 */
export function removeDarkListener() {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .removeEventListener("change", () => {});
}

/**
 * 切换主题模式
 * @param mode 模式
 */
export function changeThemeMode(themeModel: ThemeModel) {
  const themeConfig = getCurrentThemeConfig();
  themeConfig.model = themeModel;
  if (themeModel.followSystem) {
    themeConfig.model.value = isDarkMode() ? "dark" : "light";
  }
  applyTheme(themeConfig);
}

/**
 * 切换主题
 * @param theme 主题
 */
export function changeTheme(theme: Theme) {
  const themeConfig = getCurrentThemeConfig();
  themeConfig.theme = theme;
  applyTheme(themeConfig);
}

/**
 * 获取主题列表
 * @returns 主题列表
 */
export function getThemeList(): Theme[] {
  return [
    {
      name: "默认",
      className: "theme-default",
    },
    {
      name: "星空",
      className: "theme-starry",
    },
    {
      name: "海洋",
      className: "theme-ocean",
    },
  ];
}
