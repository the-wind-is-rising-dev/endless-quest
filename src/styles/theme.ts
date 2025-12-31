// 存储主题配置的键
const THEME_STORAGE_KEY = "custom-theme";

// 主题
interface Theme {
  name: string; // 主题名称
  className: string; // 对应的 CSS 类名
}

// 模式
interface ThemeModel {
  name: string; // 模式名称
  value: "auto" | "light" | "dark"; // 模式值
}

// 主题配置
interface ThemeConfig {
  theme: Theme; // 主题
  model: string; // 默认主题模式
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
 * 检测当前系统是否启用亮色模式
 */
function isLightMode() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
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
    (c) => !c.startsWith("theme-") && c !== "dark-mode"
  );
  document.documentElement.className = themeClasses.join(" ");

  // 添加新的主题类
  document.documentElement.classList.add(className);
  // 判断是否启用暗黑模式
  if (mode === "dark" || (mode === "auto" && isDarkMode())) {
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
        model: getThemeModeList()[0].value,
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
      if (e.matches) {
        themeConfig.model == "auto" &&
          document.documentElement.classList.add("dark");
      } else {
        themeConfig.model == "auto" &&
          document.documentElement.classList.remove("dark");
      }
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
  themeConfig.model = themeModel.value;
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
      className: "theme-star",
    },
    {
      name: "海洋",
      className: "theme-ocean",
    },
  ];
}

/**
 * 获取主题模式列表
 * @returns 主题模式列表
 */
export function getThemeModeList(): ThemeModel[] {
  return [
    {
      name: "自动",
      value: "auto",
    },
    {
      name: "亮色",
      value: "light",
    },
    {
      name: "暗黑",
      value: "dark",
    },
  ];
}
