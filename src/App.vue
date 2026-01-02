<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  initializeTheme,
  addDarkListener,
  removeDarkListener,
} from "./themes/theme.ts";
import Theme from "./themes/Theme.vue";

const selectedTopItem = ref<string[]>(["1"]);
const selectedSiderItem = ref<string[]>(["1"]);
const openKeys = ref<string[]>(["sub1"]);

function initialize() {
  console.log("App initialized");
  // 初始化主题样式
  initializeTheme();
}
initialize();
// 组件生命周期钩子
onMounted(() => {
  initialize();
  // 添加暗黑模式监听器
  addDarkListener();
});
onUnmounted(() => {
  // 移除暗黑模式监听器
  removeDarkListener();
});
</script>

<template>
  <div class="app-layout column">
    <div class="header row">
      <div class="logo" />
      <a-menu
        v-model:selectedKeys="selectedTopItem"
        theme="dark"
        mode="horizontal"
      >
        <a-menu-item key="1">nav 1</a-menu-item>
      </a-menu>
      <Theme style="margin-left: auto" />
    </div>
    <div style="height: 3px; background: var(--border-light)" />
    <div class="row auto-fill">
      <div style="width: 200px">
        <a-menu
          v-model:selectedKeys="selectedSiderItem"
          v-model:openKeys="openKeys"
          mode="inline"
          :style="{
            height: '100%',
            borderRight: 0,
            background: 'var(--bg-sidebar)',
          }"
        >
          <a-sub-menu key="sub1">
            <template #title>
              <span>
                <user-outlined />
                subnav 1
              </span>
            </template>
            <a-menu-item key="1">option1</a-menu-item>
            <a-menu-item key="2">option2</a-menu-item>
            <a-menu-item key="3">option3</a-menu-item>
            <a-menu-item key="4">option4</a-menu-item>
          </a-sub-menu>
        </a-menu>
      </div>
      <div class="auto-fill column" style="padding: 0 24px 24px">
        <div style="height: 10000px; flex-shrink: 0"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
}
.header {
  height: 64px;
  padding: 0 24px;
  background: var(--bg-tertiary);
  .logo {
    width: 220px;
  }
}
</style>
