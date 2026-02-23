<script setup lang="ts">
import { json } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { EditorView } from "codemirror";
import { showMinimap, MinimapConfig } from "@replit/codemirror-minimap";
import { ref } from "vue";
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
const jsonErrorPos = ref<any[]>([]);
const jsonLinter = linter((view: EditorView) => {
  jsonErrorPos.value = [];
  const diagnostics: any[] = [];
  const doc = view.state.doc.toString();

  if (!doc.trim()) return diagnostics;

  try {
    JSON.parse(doc);
  } catch (e: any) {
    // 尝试更精确地定位错误位置
    const errorPos = locateJsonError(doc, e.message);
    const from: number = errorPos?.from ? errorPos?.from : 0;
    const to: number = errorPos?.to ? errorPos.to : doc.length;
    for (let i = from; i < to; i++) {
      jsonErrorPos.value.push({
        i: "red",
      });
    }
    diagnostics.push({
      from: errorPos?.from ? errorPos.from : 0,
      to: errorPos?.to ? errorPos.to : doc.length,
      severity: "error",
      message: e.message,
    });
  }

  return diagnostics;
});

/**
 * 定位 JSON 错误的具体位置
 * @param jsonString - JSON 字符串
 * @param errorMessage - 错误消息
 * @returns 错误位置对象
 */
function locateJsonError(jsonString: string, errorMessage: string) {
  // 尝试从错误消息中解析位置
  const posMatch = errorMessage.match(/position\s*(\d+)/i);
  // const lineMatch = errorMessage.match(/line\s*(\d+)/i);

  if (posMatch) {
    const pos = parseInt(posMatch[1]) - 1; // 位置通常从1开始计数
    const clampedPos = Math.max(0, Math.min(pos, jsonString.length - 1));
    return {
      from: clampedPos,
      to: clampedPos + 1,
    };
  }

  return null;
}

// 内容列表
const contentList = ref<string[]>([""]);
// 主题配置
const theme = EditorView.theme({
  "&": { fontSize: "var(--font-size-sm)" },
  ".cm-content": { fontFamily: "Monaco, Consolas, monospace" },
  ".cm-gutters": { background: "var(--bg-tertiary)" },
});
// 最小化视图(预览)
const minimapConfig: MinimapConfig = {
  create(view) {
    const dom = document.createElement("div");
    return { dom };
  },
  displayText: "blocks",
  gutters: jsonErrorPos.value,
};
// 转义字符
const isConvertEscapesList = ref<boolean[]>([true]);

/**
 * 处理 JSON 转义字符
 * @param jsonString - 原始 JSON 字符串
 * @returns 处理后的字符串
 */
function handleJsonEscapes(jsonString: string): string {
  // 使用正则表达式安全替换转义字符
  // 注意：这里需要按顺序处理，避免冲突
  return jsonString.replace(/\\(.)/g, (match, char) => {
    switch (char) {
      case '"':
        return '"';
      case "'":
        return "'";
      case "\\":
        return "\\";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "b":
        return "\b";
      case "f":
        return "\f";
      default:
        return match; // 保留未知的转义序列
    }
  });
}

/**
 * 处理 python 字典转义字符
 * @returns 处理后的字符串
 */
function handlePythonDictEscapes(jsonString: string): string {
  return jsonString
    .replace(/"/g, '\\"')
    .replace(/\[\s*'/g, '["')
    .replace(/'\s*]/g, '"]')
    .replace(/{\s*'/g, '{"')
    .replace(/,\s*'/g, ',"')
    .replace(/'\s*:/g, '":')
    .replace(/:\s*'/g, ':"')
    .replace(/'\s*,/g, '",')
    .replace(/'\s*}/g, '"}');
}

/**
 * 解析 JSON 字符串
 * @param jsonString - JSON 字符串
 * @param index - 当前索引
 * @returns 解析后的对象
 */
function parseJson(jsonString: string, isConvertEscapes: boolean = false): any {
  const origin_content = jsonString;
  let result = null;
  const handleEscapesList = [handlePythonDictEscapes, handleJsonEscapes];
  while (null == result) {
    try {
      result = JSON.parse(jsonString);
    } catch (e) {
      jsonString = origin_content;
    }
    // 成功解析则跳出
    if (null != result) {
      break;
    }
    // 不处理转义字符则跳出
    if (!isConvertEscapes) {
      break;
    }
    // 无转义字符处理函数则跳出
    if (handleEscapesList.length <= 0) {
      break;
    }
    // 处理转义字符
    jsonString = handleEscapesList.pop()?.(jsonString) || jsonString;
  }
  return result;
}

// 展开/美化内容
function onExpandContent(index: number) {
  if (contentList.value[index].length <= 0) {
    message.warning("请输入内容");
    return;
  }

  let content = contentList.value[index];
  content = parseJson(content, isConvertEscapesList.value[index]);
  if (null == content) {
    message.error("无法解析的 JSON 字符串");
    throw new Error("无法解析的 JSON 字符串");
  }
  content = JSON.stringify(content, null, 2);
  contentList.value.splice(index, 1, content);
  message.success("展开成功");
}

// 压缩内容
function onCompressContent(index: number) {
  if (contentList.value[index].length <= 0) {
    message.warning("请输入内容");
    return;
  }
  let content = contentList.value[index];
  content = parseJson(content, isConvertEscapesList.value[index]);
  if (null == content) {
    message.error("无法解析的 JSON 字符串");
    throw new Error("无法解析的 JSON 字符串");
  }

  content = JSON.stringify(content);
  contentList.value.splice(index, 1, content);
  message.success("压缩成功");
}

// 复制内容
function onCopyContent(index: number) {
  navigator.clipboard.writeText(contentList.value[index]);
  message.success("复制成功");
}

// 添加转义字符
function onAddEscapeCharacters(index: number) {
  if (contentList.value[index].length <= 0) {
    message.warning("请输入内容");
    return;
  }
  let content = contentList.value[index];
  content = JSON.stringify(content);
  contentList.value.splice(index, 1, content.substring(1, content.length - 1));
  message.success("添加转义字符成功");
}

// 去除转义字符
function onRemoveEscapeCharacters(index: number) {
  if (contentList.value[index].length <= 0) {
    message.warning("请输入内容");
    return;
  }
  let content = contentList.value[index];
  content = handleJsonEscapes(content);
  contentList.value.splice(index, 1, content);
  message.success("去除转义字符成功");
}

// Unicode 转中文
function onUnicodeToChinese(index: number) {
  if (contentList.value[index].length <= 0) {
    message.warning("请输入内容");
    return;
  }
  let content = contentList.value[index];
  try {
    const text = content;
    // 方法1: 使用JSON.parse（适用于完整的Unicode字符串）
    content = JSON.parse('"' + text.replace(/"/g, '\\"') + '"');
  } catch {
    const text = content;
    // 方法2: 正则替换
    content = text.replace(/\\u([\dA-Fa-f]{4})/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16)),
    );
  }
  contentList.value.splice(index, 1, content);
  message.success("Unicode 转中文成功");
}

/**
 * 简洁实用的中英文混合编码
 * @param {string} text 输入字符串
 * @returns {string} 编码后的字符串
 */
function encodeChineseEmoji(text: string) {
  const result = [];

  for (const char of text) {
    const code = char.charCodeAt(0);

    // 判断是否中文 (基本中文范围)
    const isChinese =
      (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf);

    // 判断是否表情 (常见表情范围)
    const isEmoji =
      (code >= 0xd800 && code <= 0xdfff) || // 代理对
      (code >= 0x2600 && code <= 0x27ff) || // 符号
      (code >= 0x1f300 && code <= 0x1f9ff); // 表情

    if (isChinese || isEmoji) {
      const codePoint = char.codePointAt(0);
      if (codePoint === undefined) {
        result.push(char);
        continue;
      }
      if (codePoint > 0xffff) {
        // 处理表情符号的代理对
        const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xd800;
        const low = ((codePoint - 0x10000) % 0x400) + 0xdc00;
        result.push("\\u" + high.toString(16).toUpperCase().padStart(4, "0"));
        result.push("\\u" + low.toString(16).toUpperCase().padStart(4, "0"));
      } else {
        result.push(
          "\\u" + codePoint.toString(16).toUpperCase().padStart(4, "0"),
        );
      }
    } else {
      result.push(char);
    }
  }

  return result.join("");
}

// 中文转 Unicode
function onChineseToUnicode(index: number) {
  if (contentList.value[index].length <= 0) {
    message.warning("请输入内容");
    return;
  }
  let content = contentList.value[index];
  content = encodeChineseEmoji(content);
  contentList.value.splice(index, 1, content);

  message.success("中文转 Unicode 成功");
}

//  压缩并转义
function onCompressAndConvertEscapes(index: number) {
  if (contentList.value[index].length <= 0) {
    message.warning("请输入内容");
    return;
  }
  let content = contentList.value[index];
  // 压缩
  content = parseJson(content, false);
  if (null == content) {
    message.error("无法解析的 JSON 字符串");
    throw new Error("无法解析的 JSON 字符串");
  }
  content = JSON.stringify(content);
  // 转义
  content = JSON.stringify(content);
  contentList.value.splice(index, 1, content.substring(1, content.length - 1));

  message.success("压缩并转义成功");
}

// 自动转义字符
function onAutoConvertEscapes(index: number) {
  isConvertEscapesList.value.splice(
    index,
    1,
    !isConvertEscapesList.value[index],
  );
  if (isConvertEscapesList.value[index]) {
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
    isConvertEscapesList.value[index],
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
      <div class="row column-center" style="margin-bottom: var(--space-sm)">
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
          style="margin-left: var(--space-xs)"
          @click="onCopyContent(index)"
        >
          <CopyOutlined />
        </a-button>
        <a-button
          style="margin-left: var(--space-md)"
          @click="onAddEscapeCharacters(index)"
        >
          添加转义
        </a-button>
        <a-button
          style="margin-left: var(--space-xs)"
          @click="onRemoveEscapeCharacters(index)"
        >
          去除转义
        </a-button>
        <a-button
          style="margin-left: var(--space-xs)"
          @click="onUnicodeToChinese(index)"
        >
          Unicode 转中文
        </a-button>
        <a-button
          style="margin-left: var(--space-xs)"
          @click="onChineseToUnicode(index)"
        >
          转中文转 Unicode
        </a-button>
        <a-button
          style="margin-left: var(--space-xs)"
          @click="onCompressAndConvertEscapes(index)"
        >
          压缩并转义
        </a-button>
        <a-radio
          class="center"
          style="margin-left: var(--space-md); user-select: none"
          v-model:checked="isConvertEscapesList[index]"
          @click="onAutoConvertEscapes(index)"
        >
          自动去除转义字符
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
          v-if="contentList.length < 1"
          style="margin-left: var(--space-xs)"
          @click="onSplitCodemirror(index)"
        >
          <SplitCellsOutlined />
        </a-button>
      </div>
      <!-- 编辑展示栏 -->
      <div class="codemirror-content">
        <codemirror
          v-model="contentList[index]"
          style="width: 100%; height: 100%"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
          :extensions="[
            json(),
            jsonLinter,
            lintGutter(),
            theme,
            EditorView.lineWrapping,
            showMinimap.of(minimapConfig),
          ]"
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
.codemirror-content {
  height: 100%;
  overflow-y: auto;
  border: 1px solid var(--border-medium);
}
.cm-minimap {
  white-space: pre-wrap; /* 支持换行 */
  word-break: break-all; /* 强制断词 */
}
</style>
