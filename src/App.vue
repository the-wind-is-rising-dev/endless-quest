<script setup>
import { onMounted, onUnmounted } from "vue";
import { initializeTheme } from "./styles/Theme.ts";

// 组件生命周期钩子
onMounted(() => {
  // 添加暗黑模式监听器
  addDarkListener();
});
onUnmounted(() => {
  // 移除暗黑模式监听器
  removeDarkListener();
});

function initialize() {
  console.log("App initialized");
  // 初始化主题样式
  initializeTheme();
}
initialize();
</script>

<template>
  <div>Hello, World!</div>
</template>

<style scoped></style>
