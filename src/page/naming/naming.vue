<script setup lang="ts">
import { ref, watch } from "vue";
import router from "../../router";

const isDisplayAllTools = ref<boolean>(true);

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
}
initialize();
</script>

<template>
  <div v-if="isDisplayAllTools">Naming</div>
  <router-view v-else></router-view>
</template>

<style scoped lang="css"></style>
