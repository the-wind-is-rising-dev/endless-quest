<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import {
  initializeTheme,
  addDarkListener,
  removeDarkListener,
} from "./themes/theme.ts";
import Theme from "./themes/Theme.vue";
import router, { routes } from "./router/index.ts";
import DateUtils from "./utils/DateUtils.ts";

const toolList = ref<any[]>(routes);
const selectedTool = ref<string[]>([]);
const subToolList = ref<any[]>(routes[0].children);
const selectedSubTool = ref<string[]>([]);

const currentDatetime = ref<string>(
  DateUtils.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss")
);
const interval = ref<any>(null);

// 选择工具
function onSelectTool(tool: any) {
  if (selectedTool.value.includes(tool.path)) return;
  selectedTool.value = [tool.path];
  router.push(tool.path);
}

// 选择子工具
function onSelectSubTool(subTool: any) {
  if (selectedSubTool.value.includes(subTool.path)) return;
  selectedSubTool.value = [subTool.path];
  router.push(`${selectedTool.value[0]}/${subTool.path}`);
}

function initialize() {
  // 初始化主题样式
  initializeTheme();
  // 监听路由变化，选择当前工具
  watch(
    () => router.currentRoute.value.path,
    (n, _o) => {
      const pathList = n.split("/").filter((item) => item !== "");
      if (pathList.length <= 0) return;
      selectedTool.value = [`/${pathList[0]}`];
      subToolList.value =
        toolList.value.find((item) => item.path === selectedTool.value[0])
          ?.children || [];
      selectedSubTool.value = pathList.length < 2 ? [] : [`${pathList[1]}`];
    }
  );
}
initialize();
// 组件生命周期钩子
onMounted(() => {
  initialize();
  // 添加暗黑模式监听器
  addDarkListener();
  interval.value = setInterval(() => {
    currentDatetime.value = DateUtils.formatDateTime(
      new Date(),
      "yyyy-MM-dd hh:mm:ss"
    );
  }, 200);
});
onUnmounted(() => {
  // 移除暗黑模式监听器
  removeDarkListener();
  if (interval.value) {
    clearInterval(interval.value);
  }
});
</script>

<template>
  <div class="app-root column">
    <div class="app-header row">
      <div class="logo column-center">{{ currentDatetime }}</div>
      <div class="toolbar row center auto-fill">
        <div
          :class="`item center ${
            selectedTool.includes(tool.path) ? 'selected' : ''
          }`"
          v-for="tool in toolList"
          :key="tool.path"
          @click="onSelectTool(tool)"
        >
          {{ tool.title }}
        </div>
      </div>
      <Theme />
    </div>
    <div class="row auto-fill">
      <div class="siderbar">
        <div style="margin-top: var(--space-2xl)">
          <div
            :class="`item ${
              selectedSubTool.includes(subTool.path) ? 'selected' : ''
            }`"
            v-for="subTool in subToolList"
            :key="subTool.path"
            @click="onSelectSubTool(subTool)"
          >
            {{ subTool.title }}
          </div>
        </div>
      </div>
      <div class="auto-fill column">
        <div style="background: var(--bg-sidebar)">
          <div
            style="
              width: 100%;
              height: var(--space-lg);
              margin-top: var(--space-2xl);
              background: var(--bg-primary);
              border-top-left-radius: var(--space-2xl);
            "
          />
        </div>
        <div class="auto-fill" style="margin-left: var(--space-lg)">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-root {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
}
.app-header {
  height: 64px;
  padding: 0 var(--space-lg);
  background: var(--bg-tertiary);
  .logo {
    color: var(--brand-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
  }
}
.toolbar {
  padding: var(--space-md);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  user-select: none;

  .item {
    margin: var(--space-lg);
    padding: var(--space-xs) var(--space-sm);
    cursor: pointer;
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--brand-secondary);
      color: var(--text-inverse);
    }

    &:active {
      background: var(--brand-primary);
      color: var(--text-inverse);
    }

    &.selected {
      background: var(--brand-primary);
      color: var(--text-inverse);

      &:hover {
        background: var(--brand-primary);
      }
    }
  }
}

.siderbar {
  width: 160px;
  background: var(--bg-sidebar);
  user-select: none;

  .item {
    margin: var(--space-sm) var(--space-md) 0 var(--space-md);
    padding: var(--space-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;

    &:hover {
      background: var(--brand-secondary);
      color: var(--text-inverse);
    }

    &.active {
      background: var(--brand-accent);
      color: var(--text-inverse);
    }

    &.selected {
      background: var(--brand-accent);
      color: var(--text-inverse);

      &:hover {
        background: var(--brand-accent);
      }
    }
  }
}
</style>
