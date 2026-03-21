<script setup lang="ts">
import { message } from "ant-design-vue";
import VirtualTable from "../../components/virtual-table.vue";
import { Base64 } from "js-base64";
import { ref } from "vue";
import { subtitleTranslate } from "../../api/agent";

const currentHistoryIndex = ref<number>();
const historyList = ref<any[]>([]);
interface SubtitleBlock {
  index: string;
  timerShaft: string;
  original: string;
  translation: string;
}
// 禁用字幕编辑
const isDisabledEdit = ref<boolean>(false);
const space = 8;
const itemHeight = 125;
const subtitleBlockList = ref<SubtitleBlock[]>([]);

const subtitleInput = ref<any>(null);
// 字幕文件名
const subtitleFilename = ref<string>("");
// 翻译语言
const language = ref<string>("中文");
// 滚动位置
const scrollViewRef = ref<any>(null);
// 滚动到指定位置
function smoothScrollTo(targetPosition: number, duration: number) {
  const startPosition = scrollViewRef.value.$el.scrollTop;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();
  const intervalId = setInterval(() => {
    const currentTime = performance.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // 使用 easeInOutCubic 缓动函数，让滚动更平滑
    const easeProgress =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    const newPosition = startPosition + distance * easeProgress;
    scrollViewRef.value.$el.scrollTop = newPosition;

    // 滚动完成，清理 interval
    if (progress >= 1) {
      clearInterval(intervalId);
      scrollViewRef.value.$el.scrollTop = startPosition + distance; // 确保最终位置精确
    }
  }, 16); // 约 60fps
}
// 处理字幕文件上传
function handleSubtitleUpload(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  // 检查文件类型
  if (
    !file.name.endsWith(".srt") &&
    !file.name.endsWith(".ass") &&
    !file.name.endsWith(".ssa") &&
    !file.name.endsWith(".ttml") &&
    !file.name.endsWith(".tt") &&
    !file.name.endsWith(".itt") &&
    !file.name.endsWith(".ttml")
  ) {
    alert("请选择字幕文件");
    return;
  }

  // 限制文件大小（例如 5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert("字幕文件大小不能超过 5MB");
    return;
  }
  // 保存文件名
  subtitleFilename.value = file.name;

  // 读取文件内容
  const reader = new FileReader();
  reader.onload = (e: any) => {
    const subtitleOriginal = Base64.decode(
      e.target.result.replace(/^data:.+;base64,/, ""),
    );
    subtitleBlockList.value = srtSubtitleParse(subtitleOriginal);
    if (scrollViewRef.value.$el) {
      scrollViewRef.value.$el.scrollTop = 0;
    }
  };
  reader.readAsDataURL(file);
}

// srt字幕解析函数
function srtSubtitleParse(subtitle: string): SubtitleBlock[] {
  // 按空行分割字幕块, 第一行：序号，第二行：时间轴，其余行：字幕文本
  const blocks = subtitle.trim().split("\n\n");
  return blocks.map((block) => {
    const lines: string[] = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    return {
      index: lines[0],
      timerShaft: lines[1],
      original: lines.slice(2).join("\n"),
      translation: "",
    };
  });
}

// 翻译中
const translating = ref<boolean>(false);
const authorization = ref<string>("");
// 翻译字幕
async function onTranslateClick() {
  if (subtitleBlockList.value.length <= 0) {
    message.error("请选择字幕文件");
    return;
  }
  if (authorization.value.length <= 0) {
    message.error("请填写 Deepseek 授权信息");
    return;
  }
  if (translating.value) {
    return;
  }
  translating.value = true;
  isDisabledEdit.value = true;
  isDisabledSave.value = true;

  const step = 100;
  for (let idx = 0; idx < subtitleBlockList.value.length; idx = idx + step) {
    const end = Math.min(idx + step, subtitleBlockList.value.length);
    const subtitle = subtitleBlockList.value
      .slice(idx, end)
      .map((it) => {
        return it.original + " #$#%#@#";
      })
      .join("\n");
    const translationList: string[] = [];
    let result = "";
    await subtitleTranslate(
      subtitle,
      authorization.value,
      language.value,
      (_done: boolean, _reason: string, content: string) => {
        result = result + content;
        const index = result.indexOf("#$#%#@#");
        if (index < 0) {
          return;
        }
        translationList.push(result.substring(0, index).trim());
        result = "";
        subtitleBlockList.value[idx + translationList.length - 1].translation =
          translationList[translationList.length - 1];

        if (idx + translationList.length > 2) {
          const scrollHeight =
            (itemHeight + space) * (idx + translationList.length - 2);
          scrollViewRef.value.$el.scrollTop = scrollHeight;
        }
      },
    ).finally(() => {
      translating.value = false;
      isDisabledEdit.value = false;
      isDisabledSave.value = false;
    });
  }
}

// 禁用保存按钮
const isDisabledSave = ref<boolean>(false);
/// 保存翻译结果
function saveTranslation() {
  {
    const content = subtitleBlockList.value
      .map((item) => {
        return `${item.index.trim()}\n${item.timerShaft.trim()}\n${item.translation.trim()}`;
      })
      .join("\n\n");
    const filename =
      subtitleFilename.value.substring(
        0,
        subtitleFilename.value.lastIndexOf("."),
      ) +
      "-" +
      language.value +
      ".srt";

    // 创建 Blob 对象
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

    // 创建下载链接
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
</script>
<template>
  <div class="subtitle-root row">
    <!-- 翻译历史记录 -->
    <div class="translation-history column">
      <div>翻译记录</div>
      <div class="column" style="overflow-y: auto">
        <div
          class="history-item"
          v-for="(item, index) in historyList"
          :key="index"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
    <!-- 翻译区 -->
    <div class="translation-area column auto-fill">
      <!-- 操作区 -->
      <div class="operation-area row column-center">
        <a-button
          type="primary"
          @click="subtitleInput.click()"
          style="margin-right: var(--space-lg)"
        >
          选择文件
          <input
            ref="subtitleInput"
            type="file"
            accept=".srt,.ass,.ssa,.ttml,.tt,.itt,.ttml"
            @change="handleSubtitleUpload"
            style="display: none"
          />
        </a-button>
        <!-- 翻译语言选择 -->
        <div class="center" style="margin-right: var(--space-lg)">
          <div style="width: 80px">翻译语言：</div>
          <a-select v-model:value="language" style="width: 100px">
            <a-select-option value="中文">中文</a-select-option>
            <a-select-option value="英语">英语</a-select-option>
            <a-select-option value="俄语">俄语</a-select-option>
            <a-select-option value="法语">法语</a-select-option>
            <a-select-option value="德语">德语</a-select-option>
            <a-select-option value="日语">日语</a-select-option>
            <a-select-option value="韩语">韩语</a-select-option>
            <a-select-option value="西班牙语">西班牙语</a-select-option>
            <a-select-option value="意大利语">意大利语</a-select-option>
          </a-select>
        </div>
        <!-- deepseek token -->
        <a-input
          v-model:value="authorization"
          placeholder="Deepseek token"
          style="width: 150px; margin-right: var(--space-lg)"
        />
        <!-- 开始翻译按钮 -->
        <a-button
          type="primary"
          @click="onTranslateClick"
          :disabled="translating"
          style="margin-right: auto"
        >
          开始翻译
        </a-button>
        <!-- 字幕文件名 -->
        <div v-if="subtitleFilename" class="subtitle-filename">
          《{{ subtitleFilename }}》
        </div>
        <!-- 保存翻译按钮 -->
        <a-button
          type="primary"
          @click="saveTranslation"
          :disabled="isDisabledSave"
        >
          保存 SRT 翻译字幕
        </a-button>
      </div>
      <!-- 字幕、翻译结果内容显示区 -->
      <div class="subtitle-content auto-fill">
        <virtual-table
          ref="scrollViewRef"
          :items="subtitleBlockList"
          :space="space"
          :itemHeight="itemHeight"
          :visible-rows="10"
        >
          <template #item="{ item }">
            <div class="subtitle-item">
              <!-- 序号、时间轴 -->
              <div class="row column-center">
                <div class="index center">{{ item.index }}</div>
                <div class="timer-shaft" style="margin-left: var(--space-md)">
                  {{ item.timerShaft }}
                </div>
              </div>
              <!-- 原文 -->
              <div class="original row">
                原文：
                <span
                  v-for="(it, idx) in item.original.split('\n')"
                  :key="idx"
                  style="
                    margin-right: var(--space-lg);
                    padding: 2px 3px;
                    border: 1px solid var(--border-heavy);
                    border-radius: var(--radius-sm);
                    background: var(--bg-secondary);
                  "
                >
                  {{ it }}
                </span>
              </div>
              <!-- 翻译结果 -->
              <div class="translation row column-center">
                译文：
                <a-textarea
                  v-model:value="item.translation"
                  :disabled="isDisabledEdit"
                  :rows="1.5"
                  style="width: 650px"
                />
              </div>
            </div>
          </template>
        </virtual-table>
      </div>
    </div>
  </div>
</template>
<style lang="css" scoped>
.subtitle-root {
  width: 100%;
  height: 100%;
}
.translation-history {
  margin-bottom: var(--space-md);
  padding: var(--space-sm) var(--space-sm) 0 var(--space-sm);
  width: 180px;
  border: 1px solid var(--border-medium);
  box-sizing: border-box;
  border-radius: var(--radius-sm);
  .history-item {
    padding: var(--space-sm);
    cursor: pointer;
    &.selected {
    }
    &:hover {
    }
  }
}
.translation-area {
  padding: 0 var(--space-md);
  .operation-area {
    .subtitle-filename {
      margin-right: auto;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .subtitle-content {
    margin-top: var(--space-sm);
    padding: var(--space-sm);
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-sm);
    overflow-y: auto;
  }
}
.subtitle-item {
  padding: var(--space-sm);
  background: var(--bg-tertiary);
  border: 1px dashed var(--border-heavy);
  border-radius: var(--radius-sm);
  .index {
    min-width: 34px;
    padding: var(--space-xs);
    background: var(--bg-secondary);
    border: 1px dashed var(--border-heavy);
    box-sizing: border-box;
    border-radius: 34px;
    color: var(--text-secondary);
  }
  .timer-shaft {
    color: var(--text-secondary);
  }
  .original {
    margin-top: var(--space-xs);
  }
  .translation {
    margin-top: var(--space-sm);
  }
}
</style>
