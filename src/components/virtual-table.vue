<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";

const props = defineProps({
  // 数据源 (必须)
  items: {
    type: Array,
    required: true,
  },
  // 行高 (必须，单位px)
  itemHeight: {
    type: Number,
    required: true,
  },
  // 容器宽度 (可选，未指定则撑满父元素)
  width: {
    type: [String, Number],
    default: "100%",
  },
  // 容器高度 (可选，未指定则撑满父元素)
  height: {
    type: [String, Number],
    default: "100%",
  },
  // item 间距 (可选，默认5px)
  space: {
    type: Number,
    default: 8,
  },
  // 上下缓冲区行数，避免快速滚动白屏 (默认5)
  bufferSize: {
    type: Number,
    default: 5,
  },
});

// 引用
const viewportRef = ref<any>(null);

// 滚动位置
const scrollTop = ref(0);
// 实际容器高度 (动态计算)
const viewportHeight = ref(0);

// 每项实际高度
const itemActualHeight = computed(() => {
  return props.itemHeight + props.space;
});

// 计算总数据量
const totalItems = computed(() => props.items.length);

// 总高度
const totalHeight = computed(() => totalItems.value * itemActualHeight.value);

// 计算起始索引 (基于scrollTop)
const startIndex = computed(() => {
  const rawStart = Math.floor(scrollTop.value / itemActualHeight.value);
  return Math.max(0, rawStart - props.bufferSize);
});

// 计算结束索引
const endIndex = computed(() => {
  const rawEnd = Math.ceil(
    (scrollTop.value + viewportHeight.value) / itemActualHeight.value,
  );
  return Math.min(totalItems.value - 1, rawEnd + props.bufferSize);
});

// 实际需要渲染的行数据
const visibleRows = computed(() => {
  const start = startIndex.value;
  const end = endIndex.value;
  return props.items
    .map((item, index) => ({
      index: start + index,
      data: item,
    }))
    .slice(start, end + 1);
});

// 偏移量
const offsetY = computed(() => startIndex.value * itemActualHeight.value);

// 容器样式
const containerStyle = computed(() => {
  const style: any = {};
  style.width =
    typeof props.width === "number" ? `${props.width}px` : props.width;
  style.height =
    typeof props.height === "number" ? `${props.height}px` : props.height;
  return style;
});

// 更新容器高度
const updateViewportHeight = () => {
  if (viewportRef.value) {
    const height = viewportRef.value.clientHeight;
    if (viewportHeight.value !== height) {
      viewportHeight.value = height;
    }
  }
};

// 滚动事件
const onScroll = (e: any) => {
  scrollTop.value = e.target.scrollTop;
};

// 监听数据变化，确保滚动位置有效
watch(
  () => props.items,
  () => {
    // 如果数据变化后总高度变小，且当前滚动位置超出范围，修正滚动
    nextTick(() => {
      if (viewportRef.value) {
        const maxScroll = Math.max(
          0,
          totalHeight.value - viewportRef.value.clientHeight,
        );
        if (viewportRef.value.scrollTop > maxScroll) {
          viewportRef.value.scrollTop = maxScroll;
        }
      }
    });
  },
);

// 使用ResizeObserver监听视口尺寸变化
let resizeObserver: any = null;

onMounted(() => {
  // 初始化容器高度
  updateViewportHeight();

  // 监听容器大小变化
  resizeObserver = new ResizeObserver(() => {
    updateViewportHeight();
  });

  if (viewportRef.value) {
    resizeObserver.observe(viewportRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});
defineExpose({
  $el: viewportRef,
});
</script>

<template>
  <!-- 虚拟滚动视口 -->
  <div
    ref="viewportRef"
    class="virtual-viewport"
    :style="containerStyle"
    @scroll="onScroll"
  >
    <!-- 占位块，撑开滚动空间 -->
    <div class="virtual-phantom" :style="{ height: totalHeight + 'px' }" />

    <!-- 渲染内容区，绝对定位跟随滚动 -->
    <div
      class="virtual-content"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="row in visibleRows"
        :key="row.index"
        :style="{ height: itemActualHeight + 'px' }"
      >
        <!-- 通过插槽让外部自定义每一项的渲染内容 -->
        <slot
          name="item"
          :item="{ ...row.data }"
          :index="row.index"
          :style="{ height: itemHeight + 'px' }"
        >
          <!-- 默认渲染，当外部没有提供自定义插槽时使用 -->
          <div>
            <span>#{{ row.index + 1 }}</span>
            <span>{{ row.data }}</span>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-viewport {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow-y: auto;
}

.virtual-phantom {
  width: 100%;
  pointer-events: none;
}

.virtual-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  will-change: transform;
}
</style>
