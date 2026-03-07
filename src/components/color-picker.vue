<script setup lang="ts">
import { SketchPicker } from "vue-color";
const props = defineProps<{ width?: number; height?: number }>();
// 颜色值
const color = defineModel("color", {
  type: String,
  required: true,
});
// 处理颜色变化，确保同步到 model
const handleChange = (newColor: any) => {
  // 根据 vue-color 返回的结构，可能需要取 newColor.hex 或 newColor.rgba
  color.value = newColor.hex || newColor;
};
</script>
<template>
  <div>
    <a-popover>
      <!-- 自定义弹出内容 -->
      <template #content>
        <div>
          <SketchPicker :value="color" @input="handleChange" />
        </div>
      </template>

      <!-- 颜色显示方块 -->
      <div
        class="color-preview"
        :style="{
          width: width + 'px',
          height: height + 'px',
          backgroundColor: color,
        }"
      />
    </a-popover>
  </div>
</template>

<style lang="css" scoped>
.color-preview {
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 3px;
}
</style>
