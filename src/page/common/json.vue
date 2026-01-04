<script setup lang="ts">
import { json } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import { EditorView } from "codemirror";
import { reactive, ref, shallowRef } from "vue";
import { Codemirror } from "vue-codemirror"; // 注意组件名
import {
  ExpandOutlined,
  CompressOutlined,
  CopyOutlined,
  MergeCellsOutlined,
  SplitCellsOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

// JSON 语法检查器
const jsonLinter = linter((view: EditorView) => {
  const diagnostics: any[] = [];
  try {
    JSON.parse(view.state.doc.toString());
  } catch (e: any) {
    diagnostics.push({
      from: 0,
      to: view.state.doc.length,
      severity: "error",
      message: e.message,
    });
  }
  return diagnostics;
});

// 内容列表
const contentList = ref<string[]>([""]);
// 主题配置
const theme = EditorView.theme({
  "&": { fontSize: "var(--font-size-sm)" },
  ".cm-content": { fontFamily: "Monaco, Consolas, monospace" },
  ".cm-gutters": { background: "var(--bg-tertiary)" },
});
// 转义字符
const isConvertEscapesList = ref<boolean[]>([true]);

/**
 * 处理 JSON 转义字符
 * @param jsonString - 原始 JSON 字符串
 * @param options - 配置选项
 * @returns 处理后的字符串
 */
function handleJsonEscapes(jsonString: string): string {
  // 反转义常见字符
  return jsonString
    .replace(/\\"/g, '"') // \" -> "
    .replace(/\\'/g, "'") // \' -> '
    .replace(/\\\\/g, "\\") // \\ -> \
    .replace(/\\n/g, "\n") // \n -> 换行符或空格
    .replace(/\\r/g, "") // \r -> (移除)
    .replace(/\\t/g, "\t") // \t -> 制表符
    .replace(/\\b/g, "\b") // \b -> 退格符
    .replace(/\\f/g, "\f"); // \f -> 换页符
}

// 展开/美化内容
function onExpandContent(index: number) {
  if (contentList.value[index].length <= 0) {
    message.warning("请输入内容");
    return;
  }
  const content = isConvertEscapesList.value[index]
    ? handleJsonEscapes(contentList.value[index])
    : contentList.value[index];
  contentList.value.splice(
    index,
    1,
    JSON.stringify(JSON.parse(content), null, 2)
  );
}

// 压缩内容
function onCompressContent(index: number) {
  if (contentList.value[index].length <= 0) {
    message.warning("请输入内容");
    return;
  }
  const content = isConvertEscapesList.value[index]
    ? handleJsonEscapes(contentList.value[index])
    : contentList.value[index];
  contentList.value.splice(index, 1, JSON.stringify(JSON.parse(content)));
  message.success("压缩成功");
}

// 复制内容
function onCopyContent(index: number) {
  navigator.clipboard.writeText(contentList.value[index]);
  message.success("复制成功");
}

// 转义字符
function onConvertEscapes(index: number) {
  isConvertEscapesList.value.splice(
    index,
    1,
    !isConvertEscapesList.value[index]
  );
  if (isConvertEscapesList.value[index]) {
    contentList.value.splice(
      index,
      1,
      handleJsonEscapes(contentList.value[index])
    );
    message.success("已开启转义字符");
  } else {
    message.warning("已关闭转义字符");
  }
}

// 合并一个代码编辑器
function onCompressCodemirror(index: number) {
  contentList.value.splice(index, 1);
  isConvertEscapesList.value.splice(index, 1);
  message.warning("删除成功");
}

// 拆分一个代码编辑器出了
function onSplitCodemirror(index: number) {
  contentList.value.splice(index + 1, 0, "");
  isConvertEscapesList.value.splice(
    index + 1,
    0,
    isConvertEscapesList.value[index]
  );
  message.success("拆分成功");
}
</script>

<template>
  <div class="json-root row">
    <div
      v-for="(_item, index) in contentList"
      class="codemirror-container column auto-fill"
    >
      <!-- 操作栏 -->
      <div class="row" style="margin-bottom: var(--space-sm)">
        <a-button type="primary" ghost @click="onExpandContent(index)">
          <ExpandOutlined />
        </a-button>
        <a-button
          type="primary"
          ghost
          style="margin-left: var(--space-xs)"
          @click="onCompressContent(index)"
        >
          <CompressOutlined />
        </a-button>
        <a-button
          style="margin-left: var(--space-md)"
          @click="onCopyContent(index)"
        >
          <CopyOutlined />
        </a-button>
        <a-radio
          class="center"
          style="margin-left: var(--space-md); user-select: none"
          v-model:checked="isConvertEscapesList[index]"
          @click="onConvertEscapes(index)"
        >
          自动转义字符
        </a-radio>
        <div style="margin-left: auto" />
        <a-popconfirm
          title="确定删除该窗口?"
          ok-text="确定"
          cancel-text="取消"
          @confirm="onCompressCodemirror(index)"
        >
          <a-button v-if="contentList.length > 1">
            <MergeCellsOutlined />
          </a-button>
        </a-popconfirm>
        <a-button
          v-if="contentList.length < 3"
          style="margin-left: var(--space-xs)"
          @click="onSplitCodemirror(index)"
        >
          <SplitCellsOutlined />
        </a-button>
      </div>
      <!-- 编辑展示栏 -->
      <div class="auto-fill">
        <codemirror
          v-model="contentList[index]"
          style="width: 100%; height: 100%"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
          :extensions="[json(), jsonLinter, theme]"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.json-root {
  width: 100%;
  height: 100%;
}
.codemirror-container {
  height: 100%;
  margin-right: var(--space-lg);
}
</style>
