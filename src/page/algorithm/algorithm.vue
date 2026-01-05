<script setup lang="ts">
import { ref, watch } from "vue";
import { router, routes } from "../../router";

const currentRouteIndex = 1;
const isDisplayAllTools = ref<boolean>(true);
const cardList = ref<any[]>([]);

// 点击卡片
function onClickCard(item: any) {
  const path = `${routes[currentRouteIndex].path}/${item.path}`;
  router.push(path);
}

// 内容页面初始化
function contentInitialize(path: string) {
  const pathList = path.split("/").filter((item) => item !== "");
  if (pathList.length <= 0) return;
  isDisplayAllTools.value = pathList.length <= 1;
}

// 路由监听，根据路由变化选择具体工具 or 全部工具
watch(
  () => router.currentRoute.value.path,
  (n, _o) => {
    contentInitialize(n);
  }
);
function initialize() {
  console.log("initialize");
  contentInitialize(router.currentRoute.value.path);
  cardList.value = routes[currentRouteIndex].children;
}
initialize();
</script>

<template>
  <div v-if="isDisplayAllTools" class="fu nc-root row auto-fill">
    <div
      class="func-card"
      v-for="(item, index) in cardList"
      :key="index"
      @click="onClickCard(item)"
    >
      {{ item.title }}
    </div>
  </div>
  <router-view v-else></router-view>
</template>

<style scoped lang="css">
.func-root {
  margin-right: var(--space-lg);
  flex-wrap: wrap;
}
.func-card {
  margin-right: var(--space-lg);
  margin-bottom: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  &:hover {
    background: var(--brand-secondary);
    border: 1px solid var(--brand-secondary);
    color: var(--text-inverse);
  }
  &:active {
    background: var(--brand-accent);
    border: 1px solid var(--brand-accent);
    color: var(--text-inverse);
  }
}
</style>
