<script setup lang="ts">
import { message } from "ant-design-vue";
import { ref } from "vue";
import { MergeCellsOutlined, SplitCellsOutlined } from "@ant-design/icons-vue";
import CryptoJS from "crypto-js";

// 内容列表
const inputList = ref<string[]>([""]);
const outputList = ref<{ hex: ""; base64: "" }[]>([{ hex: "", base64: "" }]);
// 是否去除空格
const isTrimContentList = ref<boolean[]>([false]);

function onCalculate(index: number) {
  outputList.value.splice(index, 1, { hex: "", base64: "" });
  if (!inputList.value[index]) {
    message.warning("请输入内容");
    return;
  }
  if (isTrimContentList.value[index]) {
    inputList.value.splice(index, 1, inputList.value[index].trim());
  }
  const content: string = inputList.value[index];

  const wordArray = CryptoJS.SHA256(content);
  const result: any = {
    hex: wordArray.toString(CryptoJS.enc.Hex),
    base64: wordArray.toString(CryptoJS.enc.Base64),
  };
  outputList.value.splice(index, 1, result);
  message.success("计算成功");
}

// 去除空格
function onTrimContent(index: number) {
  isTrimContentList.value.splice(index, 1, !isTrimContentList.value[index]);
  if (isTrimContentList.value[index]) {
    inputList.value.splice(index, 1, inputList.value[index].trim());
    message.success("已开启去除空格");
  } else {
    message.warning("已关闭去除空格");
  }
}
// 合并一个窗口
function onCompressCodemirror(index: number) {
  inputList.value.splice(index, 1);
  outputList.value.splice(index, 1);
  isTrimContentList.value.splice(index, 1);
  message.warning("删除成功");
}

// 拆分一个窗口
function onSplitCodemirror(index: number) {
  inputList.value.splice(index + 1, 0, "");
  outputList.value.splice(index + 1, 0, { hex: "", base64: "" });
  isTrimContentList.value.splice(index + 1, 0, isTrimContentList.value[index]);
  message.success("拆分成功");
}
</script>

<template>
  <div class="sha256-root row">
    <div
      class="sha256-container auto-fill column"
      v-for="(_item, index) in inputList"
    >
      <div class="auto-fill">
        <a-textarea
          v-model:value="inputList[index]"
          style="height: 100%"
          placeholder="输入任意内容计算 SHA-256 摘要"
        />
      </div>
      <div class="row" style="margin: var(--space-md) 0">
        <a-button type="primary" ghost @click="onCalculate(index)">
          计算 SHA-256
        </a-button>
        <a-radio
          class="center"
          style="margin-left: var(--space-md); user-select: none"
          v-model:checked="isTrimContentList[index]"
          @click="onTrimContent(index)"
        >
          去除两侧空格
        </a-radio>
        <div style="margin-left: auto" />
        <a-popconfirm
          title="确定删除该窗口?"
          ok-text="确定"
          cancel-text="取消"
          @confirm="onCompressCodemirror(index)"
        >
          <a-button v-if="inputList.length > 1">
            <MergeCellsOutlined />
          </a-button>
        </a-popconfirm>
        <a-button
          v-if="inputList.length < 3"
          style="margin-left: var(--space-xs)"
          @click="onSplitCodemirror(index)"
        >
          <SplitCellsOutlined />
        </a-button>
      </div>
      <div class="auto-fill" style="margin-bottom: var(--space-lg)">
        <a-textarea
          v-model:value="outputList[index].hex"
          :row="4"
          placeholder="此处显示 16 进制计算结果"
          readonly
        />
        <div style="height: var(--space-md)" />
        <a-textarea
          v-model:value="outputList[index].base64"
          :row="4"
          placeholder="此处显示 Base64 计算结果"
          readonly
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.sha256-root {
  width: 100%;
  height: 100%;
}
.sha256-container {
  margin-right: var(--space-lg);
  height: 100%;
}
</style>
