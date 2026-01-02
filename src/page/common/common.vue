<script setup lang="ts">
import { ref, watch } from "vue";
import router from "../../router";

const isDisplayAllTools = ref<boolean>(true);

// 路由监听，根据路由变化选择具体工具 or 全部工具
watch(
  () => router.currentRoute.value.path,
  (n, _o) => {
    const pathList = n.split("/").filter((item) => item !== "");
    if (pathList.length <= 0) return;
    isDisplayAllTools.value = pathList.length <= 1;
  }
);
</script>

<template>
  <div v-if="isDisplayAllTools">Common</div>
  <router-view v-else></router-view>
</template>

<style scoped lang="css"></style>
