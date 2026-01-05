<script setup lang="ts">
import { SettingOutlined, BulbFilled } from "@ant-design/icons-vue";
import { onMounted, onUnmounted, ref } from "vue";
import {
  Theme,
  getThemeList,
  getCurrentThemeConfig,
  changeTheme,
  changeThemeMode,
} from "./theme";

const themeList = ref<Theme[]>(getThemeList());
const currentTheme = ref<Theme>(getCurrentThemeConfig().theme);
const followSystem = ref<boolean>(getCurrentThemeConfig().model.followSystem);
const isLightModel = ref<boolean>(
  getCurrentThemeConfig().model.value == "light"
);

// 切换主题
function onChangeTheme(theme: Theme) {
  currentTheme.value = theme;
  changeTheme(theme);
}

// 切换跟随系统
function onFollowSystemChange() {
  followSystem.value = !followSystem.value;
  let themeConfig = getCurrentThemeConfig();
  themeConfig.model.followSystem = followSystem.value;
  changeThemeMode(themeConfig.model);
}

// 切换主题模式
function onChangeThemeModel(value: boolean) {
  isLightModel.value = value;
  let themeConfig = getCurrentThemeConfig();
  themeConfig.model.value = value ? "light" : "dark";
  changeThemeMode(themeConfig.model);
}

// 添加主题模式监听
let interval: NodeJS.Timeout | null = null;
onMounted(() => {
  // 定时更新主题信息
  interval = setInterval(() => {
    const themeConfig = getCurrentThemeConfig();
    currentTheme.value = themeConfig.theme;
    followSystem.value = themeConfig.model.followSystem;
    isLightModel.value = themeConfig.model.value == "light";
  }, 200);
});

onUnmounted(() => {
  // 移除定时更新主题信息
  interval && clearInterval(interval);
});
</script>

<template>
  <div class="theme-root center">
    <a-dropdown placement="bottom">
      <div class="theme-btn center">
        <SettingOutlined />
      </div>
      <template #overlay>
        <a-menu>
          <div
            class="theme-item"
            v-for="theme in themeList"
            :key="theme.className"
            @click="onChangeTheme(theme)"
          >
            <div class="row">
              <div
                style="width: var(--space-xl); font-size: var(--font-size-sm)"
              >
                <BulbFilled
                  class="sign"
                  v-if="theme.className == currentTheme.className"
                />
              </div>
              <div>{{ theme.name }}-主题</div>
            </div>
          </div>
          <div class="theme-model-item row">
            <a-radio
              v-model:checked="followSystem"
              @click="onFollowSystemChange()"
              >🖥️</a-radio
            >
            <a-switch
              checked-children="☀️"
              un-checked-children="🌑"
              v-model:checked="isLightModel"
              :disabled="followSystem"
              @change="onChangeThemeModel"
            />
          </div>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<style scoped>
.theme-root {
  padding: var(--space-lg);
}
.theme-btn {
  padding: var(--space-xs) var(--space-lg);
  font-size: var(--font-size-2xl);
  color: var(--brand-primary);
}
.theme-item {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  user-select: none;
  cursor: pointer;

  .sign {
    color: var(--brand-accent);
  }

  &:hover {
    background: var(--brand-secondary);
    color: var(--text-inverse);
  }

  &:active {
    background: var(--brand-primary);
    color: var(--text-inverse);
    .sign {
      color: var(--text-inverse);
    }
  }
}
.theme-model-item {
  padding: var(--space-sm) var(--space-md);
  color: var(--text-primary);
  user-select: none;
}
</style>
