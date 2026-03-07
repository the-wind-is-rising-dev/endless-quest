<script setup lang="ts">
import { ref } from "vue";
import ColorPicker from "../../components/color-picker.vue";
import { message } from "ant-design-vue";
import QrcodeVue from "qrcode.vue";
import html2canvas from "html2canvas";

// 文本内容
const text = ref<string>(
  "https://the-wind-is-rising-dev.github.io/endless-quest",
);
// 去除文本两侧空格
const isTrimContent = ref<boolean>(true);
function onTrimContent() {
  isTrimContent.value = !isTrimContent.value;
  if (isTrimContent.value) {
    message.success("已开启去除空格");
  } else {
    message.warning("已关闭去除空格");
  }
}
// 前景色、背景色
const backgroundColor = ref<string>("#ffffff");
const foregroundColor = ref<string>("#000000");
// 大小、质量
const size = ref<number>(400);
const quality = ref<"L" | "M" | "Q" | "H">("Q");
const qualityOptions = [
  { label: "最高", value: "H" },
  { label: "高", value: "Q" },
  { label: "中", value: "M" },
  { label: "低", value: "L" },
];
const margin = ref<number>(10);
// 中间图标
const icon = ref<string>("");
// 中间图标的大小
const iconSize = ref<number>(50);
// 中间图标的旋转角度
const iconRotation = ref<number>(0);
// 中间图标的圆角
const borderRadius = ref<number>(5);
// 图标上传
const iconInput = ref();
// 处理背景图上传
const handleIconUpload = (event: any) => {
  const file = event.target.files[0];
  if (!file) return;

  // 检查文件类型
  if (!file.type.startsWith("image/")) {
    alert("请选择图片文件");
    return;
  }

  // 限制文件大小（例如 5MB）
  if (file.size > 20 * 1024 * 1024) {
    alert("图片大小不能超过 20MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e: any) => {
    icon.value = e.target.result; // 存储为 data URL
  };
  reader.readAsDataURL(file);
};

// 保存图片的方法
// 获取父容器 DOM 的引用
const qrContainer = ref(null);
// 用于存储生成的图片数据
const posterImage = ref("");
const downloadPoster = async () => {
  if (!qrContainer.value) return;

  try {
    // 调用 html2canvas 对父容器进行截图
    const canvas = await html2canvas(qrContainer.value, {
      scale: 1, // 提高图片清晰度 [citation:1][citation:6]
      backgroundColor: backgroundColor.value, // 设置背景色，避免透明背景
      useCORS: true, // 如果容器内有外部图片，启用跨域支持 [citation:1][citation:2]
      // 允许日志输出，便于调试
      logging: true,
    });

    // 将 Canvas 转换为图片数据 URL
    const imageUrl = canvas.toDataURL("image/png");
    posterImage.value = imageUrl; // 用于预览

    // 创建下载链接
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "endless-quest-qrcode.png"; // 设置下载的文件名
    link.click();
  } catch (error) {
    console.error("截图生成失败:", error);
  }
};
</script>

<template>
  <div class="qrcode-root column column-center">
    <div class="column">
      <!-- 文本内容 -->
      <div class="item row">
        <div class="title">文本内容：</div>
        <a-input
          class="value"
          v-model:value="text"
          placeholder="请输入文本内容"
          @change="
            () => {
              if (isTrimContent) {
                text = text.trim();
              }
            }
          "
        />
        <a-radio
          class="center"
          style="margin-left: var(--space-md); user-select: none"
          v-model:checked="isTrimContent"
          @click="onTrimContent()"
        >
          去除两侧空格
        </a-radio>
      </div>
      <!-- 前景色、 背景色 -->
      <div class="item row column-center">
        <div class="title">前景色：</div>
        <a-input class="value sm" v-model:value="foregroundColor" />
        <color-picker
          v-model:color="foregroundColor"
          :width="18"
          :height="18"
        />

        <div style="margin-left: var(--space-sm)">背景色：</div>
        <a-input class="value sm" v-model:value="backgroundColor" />
        <color-picker
          v-model:color="backgroundColor"
          :width="18"
          :height="18"
        />
      </div>
      <!-- 大小、质量、边距 -->
      <div class="item row column-center">
        <div class="title">二维码大小：</div>
        <a-input-number class="value xs" v-model:value="size" />
        <div>质量：</div>
        <a-select
          class="value xs"
          v-model:value="quality"
          :options="qualityOptions"
        />
        <div>边距：</div>
        <a-input-number class="value xs" v-model:value="margin" />
      </div>

      <!-- 图标设置： -->
      <div class="item row column-center">
        <div class="title">中间图标：</div>
        <a-input
          class="value sm"
          v-model:value="icon"
          placeholder="请输入图标URL"
          @change="
            () => {
              icon = icon.trim();
            }
          "
        />
        <div>大小：</div>
        <a-input-number
          class="value xs"
          v-model:value="iconSize"
          placeholder="图标大小"
        />
        <div>旋转角：</div>
        <a-input-number
          class="value xs"
          v-model:value="iconRotation"
          placeholder="旋转角度"
        />
        <a-button type="primary" ghost @click="() => iconInput.click()">
          上传图标
        </a-button>
        <input
          ref="iconInput"
          type="file"
          accept="image/*"
          @change="handleIconUpload"
          style="display: none"
        />
      </div>
    </div>
    <!-- 二维码预览区域 -->
    <div
      class="rwo column-center"
      style="margin: var(--space-sm); flex-shrink: 0"
    >
      二维码预览：
      <a-button type="primary" ghost @click="downloadPoster()">
        下载二维码
      </a-button>
    </div>
    <div
      ref="qrContainer"
      class="center"
      :style="{
        position: 'relative',
        width: size + margin * 2 + 'px',
        height: size + margin * 2 + 'px',
        padding: margin + 'px',
        backgroundColor: backgroundColor,
      }"
    >
      <!-- 中间图标 -->
      <div
        v-if="icon"
        :style="{
          position: 'absolute',
          transform: `rotate(${iconRotation}deg)`,
          backgroundImage: icon ? 'url(' + icon + ')' : 'none',
          backgroundSize: iconSize + 'px ' + iconSize + 'px',
          backgroundPosition: 'center',
          width: iconSize + 'px',
          height: iconSize + 'px',
          borderRadius: borderRadius + 'px',
        }"
      />
      <qrcode-vue
        :value="text"
        :size="size"
        :level="quality"
        :margin="0"
        :foreground="foregroundColor"
        :background="backgroundColor"
      />
    </div>
    <div style="height: var(--space-lg); flex-shrink: 0" />
  </div>
</template>
<style lang="css" scoped>
.qrcode-root {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
.item {
  margin: var(--space-xs);
  .title {
    width: 100px;
  }
  .value {
    width: 300px;
    margin-right: var(--space-md);
    &.xs {
      width: 80px;
    }
    &.sm {
      width: 120px;
    }
    &.lg {
      width: 400px;
    }
  }
}
</style>
