<script setup lang="ts">
import { message } from "ant-design-vue";
import { ref } from "vue";
import { MergeCellsOutlined, SplitCellsOutlined } from "@ant-design/icons-vue";
import { Base64 } from "js-base64";

// 内容列表
const inputList = ref<string[]>([""]);
const outputList = ref<string[]>(["asdfkaslfdjslk"]);
// 是否解码错误
const isDecodeError = ref(false);
// 是否去除空格
const isTrimContentList = ref<boolean[]>([false]);

function onEncodeContent(index: number) {
  if (!inputList.value[index]) {
    message.warning("请输入内容");
    outputList.value.splice(index, 1, "");
    return;
  }
  if (isTrimContentList.value[index]) {
    inputList.value.splice(index, 1, inputList.value[index].trim());
  }
  outputList.value.splice(index, 1, Base64.encode(inputList.value[index]));
  message.success("编码成功");
  isDecodeError.value = false;
}

function onDecodeContent(index: number) {
  if (!inputList.value[index]) {
    message.warning("请输入内容");
    outputList.value.splice(index, 1, "");
    return;
  }
  if (isTrimContentList.value[index]) {
    inputList.value.splice(index, 1, inputList.value[index].trim());
  }
  let result = "";
  try {
    result = Base64.decode(inputList.value[index]);
    message.success("解码成功");
    isDecodeError.value = false;
  } catch (error: any) {
    result = `请检查 Base64 格式是否正确\n解码失败:${error.message}`;
    message.error("解码失败:" + error);
    isDecodeError.value = true;
  }
  outputList.value.splice(index, 1, result);
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
  outputList.value.splice(index + 1, 0, "");
  isTrimContentList.value.splice(index + 1, 0, isTrimContentList.value[index]);
  message.success("拆分成功");
}
</script>

<template>
  <div class="base64-root row">
    <div
      class="base64-container auto-fill column"
      v-for="(_item, index) in inputList"
    >
      <div class="auto-fill">
        <a-textarea
          v-model:value="inputList[index]"
          style="height: 100%"
          placeholder="输入任意内容进行编码，或输入密文进行解码"
        />
      </div>
      <div class="row" style="margin: var(--space-md) 0">
        <a-button type="primary" ghost @click="onEncodeContent(index)">
          编码
        </a-button>
        <a-button
          type="primary"
          ghost
          style="margin-left: var(--space-sm)"
          @click="onDecodeContent(index)"
        >
          解码
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
          v-model:value="outputList[index]"
          :style="`height: 100%;border-color: ${
            isDecodeError ? 'var(--status-error)' : ''
          }`"
          placeholder="此处显示编码或解码结果"
          readonly
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.base64-root {
  width: 100%;
  height: 100%;
}
.base64-container {
  margin-right: var(--space-lg);
  height: 100%;
}
</style>
