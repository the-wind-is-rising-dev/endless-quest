<script setup lang="ts">
import { message } from "ant-design-vue";
import { ref } from "vue";
import {
  QrcodeStream,
  QrcodeDropZone,
  QrcodeCapture,
  DetectedBarcode,
  BarcodeFormat,
} from "vue-qrcode-reader";

// 二维码格式
// 二维码: qr_code
// 常见一维码: code_128
const formats = ref<BarcodeFormat[]>(["qr_code", "code_128"]);
// 是否打开摄像头
const openCamera = ref<boolean>(false);
// 二维码识别结果
const scanResult = ref<string>("");

// 二维码图片上传
const qrcodeInput = ref();

// 是否拖动
const isDragging = ref<boolean>(false);

// 二维码识别成功
function onDetect(detectedCodes: DetectedBarcode[]) {
  scanResult.value = detectedCodes.map((it) => it.rawValue).join("\n");
  message.success("二维码识别成功");
}

// 拖动二维码图片
function onDragOver(isOver: boolean) {
  isDragging.value = isOver;
}

// 二维码识别失败
function onError(error: any) {
  scanResult.value = error;
  console.error("识别失败:", error);
  message.error("二维码识别失败: " + error);
}
// 二维码识别
const handleScan = () => {};

// 复制内容
function onCopyContent(content: string) {
  navigator.clipboard.writeText(content);
  message.success("复制成功");
}
</script>

<template>
  <div class="scan-qrcode column column-center">
    <!-- 二维码图片上传按钮、摄像头按钮 -->
    <div class="row" style="margin-top: var(--space-md)">
      <a-button type="primary" ghost @click="() => qrcodeInput.$el.click()">
        选择二维码
        <QrcodeCapture
          ref="qrcodeInput"
          @detect="onDetect"
          @error="onError"
          :formats="formats"
          style="display: none"
        />
      </a-button>
      <a-button
        type="primary"
        ghost
        style="margin-left: var(--space-md)"
        @click="openCamera = !openCamera"
      >
        {{ openCamera ? "关闭摄像头" : "打开摄像头" }}
      </a-button>
      <a-button
        type="primary"
        style="margin-left: var(--space-md)"
        @click="onCopyContent(scanResult)"
      >
        复制结果
      </a-button>
      <a-button
        type="primary"
        style="margin-left: var(--space-md)"
        @click="scanResult = ''"
      >
        清空
      </a-button>
    </div>
    <!-- 二维码预览区域、识别结果信息区域 -->
    <div class="row" style="flex-wrap: wrap; flex-shrink: 0">
      <div
        class="center"
        style="
          width: 400px;
          height: 400px;
          margin: var(--space-md) auto auto auto;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
        "
      >
        <div
          :style="{
            width: '380px',
            height: '380px',
          }"
        >
          <QrcodeDropZone
            v-if="!openCamera"
            @detect="onDetect"
            @dragover="onDragOver"
            @error="onError"
            :formats="formats"
            class="drop-zone"
          >
            <div class="center" style="width: 100%; height: 100%">
              {{
                isDragging ? "正在识别二维码..." : "拖放图片到这里识别二维码"
              }}
            </div>
          </QrcodeDropZone>
          <QrcodeStream
            v-if="openCamera"
            @detect="onDetect"
            @error="onError"
            :constraints="{ facingMode: 'environment' }"
            class="camera-zone"
          >
          </QrcodeStream>
        </div>
      </div>
      <div style="width: var(--space-md)" />
      <a-textarea
        v-model:value="scanResult"
        disabled
        placeholder="二维码识别结果"
        style="
          width: 400px;
          height: 400px;
          margin: var(--space-md) auto auto auto;
        "
      />
      <div style="width: var(--space-md)" />
    </div>
  </div>
</template>

<style lang="css" scoped>
.scan-qrcode {
  width: 100%;
  height: 100%;
}
.drop-zone {
  width: 100%;
  height: 100%;
  border: 1px dashed var(--border-heavy);
  border-radius: var(--radius-md);
  padding: 0px;
  box-sizing: border-box;
  text-align: center;
  transition: all 0.3s;
}
.camera-zone {
  width: 100%;
  height: 100%;
  border: 1px dashed var(--border-heavy);
  box-sizing: border-box;
  .loading {
    width: 100%;
    height: 100%;
  }
  .camera-off {
    width: 100%;
    height: 100%;
  }
}
</style>
