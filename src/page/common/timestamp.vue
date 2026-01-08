<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  DoubleRightOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons-vue";
import DateUtils from "../../utils/DateUtils";
import { message } from "ant-design-vue";

const inputTimestamp = ref<number>();
const timestampConverterResult = ref<any>({
  result: "",
  date: "",
  time: "",
  timezone: "",
  GMT: "",
});
// 时间戳转换
function onTimestampConverter(isShowMessage = true) {
  const timestamp = inputTimestamp.value;
  if (timestamp === undefined || timestamp === null) {
    return;
  }

  const date = new Date(timestamp * 1000);
  const result = `${DateUtils.formatDateTime(
    date
  )} ${DateUtils.getChineseWeekday(date)} ${
    date.getHours() > 12 ? "下午" : "上午"
  }`;

  timestampConverterResult.value = {
    result: result,
    date: DateUtils.formatDateTime(date, "YYYY-MM-DD"),
    time: DateUtils.formatDateTime(date, "HH:mm:ss"),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    GMT: date.toString(),
  };
  isShowMessage && message.success("转换成功");
}

const inputDateTime = ref<string>("");
const dateTimeConverterResult = ref<any>({
  result: "",
  seconds: "",
  ms: "",
  timezone: "",
  GMT: "",
});
// 日期时间转换
function onDateTimeConverter(isShowMessage = true) {
  const dateTime = inputDateTime.value;
  if (!dateTime) {
    return;
  }

  const date: Date = DateUtils.parseDateTime(dateTime);
  const timestamp = date.getTime();

  dateTimeConverterResult.value = {
    result: Math.floor(timestamp / 1000),
    seconds: Math.floor(timestamp / 1000),
    ms: timestamp,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    GMT: date.toString(),
  };
  isShowMessage && message.success("转换成功");
}

// 当前时间戳
const currentTimestamp = ref<number>(DateUtils.timestamp());
const interval = ref<any>();
const isPaused = ref<boolean>(false);
// 复制内容
function onCopyContent(content: string) {
  navigator.clipboard.writeText(content);
  message.success("复制成功");
}
// 组件生命周期钩子
onMounted(() => {
  // 定时更新时间
  interval.value = setInterval(() => {
    if (isPaused.value) return;
    currentTimestamp.value = DateUtils.timestamp();
  }, 200);
});
onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value);
  }
});
function initialize() {
  const timestamp = DateUtils.timestamp();
  inputTimestamp.value = timestamp / 1000;
  onTimestampConverter(false);
  inputDateTime.value = DateUtils.formatDateTime(new Date(timestamp));
  onDateTimeConverter(false);
}
initialize();
</script>

<template>
  <div class="timestamp-root row">
    <div class="timestamp-body row auto-fill">
      <!-- 时间戳转换区 -->
      <div class="auto-fill column">
        <!-- 时间戳转日期 -->
        <div class="auto-fill row">
          <div class="timestamp-operation column">
            <a-input-number
              v-model:value="inputTimestamp"
              addon-before="时间戳(s)："
              size="large"
              style="width: 250px"
            />
            <a-button
              type="primary"
              size="large"
              style="margin-top: var(--space-lg)"
              @click="onTimestampConverter"
            >
              时间戳转换为日期 <DoubleRightOutlined />
            </a-button>
          </div>
          <div
            class="auto-fill row"
            style="border-left: 1px solid var(--border-medium)"
          >
            <div class="converter-result">
              <div
                class="item"
                style="
                  background: var(--bg-tertiary);
                  color: var(--text-primary);
                "
              >
                {{ timestampConverterResult.result }}
              </div>
              <div style="border-bottom: 1px solid var(--border-medium)" />
              <div class="item">日期：{{ timestampConverterResult.date }}</div>
              <div style="border-bottom: 1px solid var(--border-medium)" />
              <div class="item">时间：{{ timestampConverterResult.time }}</div>
              <div style="border-bottom: 1px solid var(--border-medium)" />
              <div class="item">
                时区：{{ timestampConverterResult.timezone }}
              </div>
              <div style="border-bottom: 1px solid var(--border-medium)" />
              <div class="item">GMT：{{ timestampConverterResult.GMT }}</div>
            </div>
          </div>
        </div>
        <!-- 日期转时间戳 -->
        <div
          class="auto-fill row"
          style="border-top: 1px solid var(--border-medium)"
        >
          <div class="timestamp-operation column">
            <a-date-picker
              show-time
              placeholder="选择日期/时间"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              v-model:value="inputDateTime"
              size="large"
              style="width: 250px"
            />
            <a-button
              type="primary"
              size="large"
              style="margin-top: var(--space-lg)"
              @click="onDateTimeConverter"
            >
              日期戳转换为时间 <DoubleRightOutlined />
            </a-button>
          </div>
          <div
            class="auto-fill row"
            style="border-left: 1px solid var(--border-medium)"
          >
            <div class="converter-result">
              <div
                class="item"
                style="
                  background: var(--bg-tertiary);
                  color: var(--text-primary);
                "
              >
                Unix 时间戳：{{ dateTimeConverterResult.result }}
              </div>
              <div style="border-bottom: 1px solid var(--border-medium)" />
              <div class="item">秒：{{ dateTimeConverterResult.seconds }}</div>
              <div style="border-bottom: 1px solid var(--border-medium)" />
              <div class="item">毫秒：{{ dateTimeConverterResult.ms }}</div>
              <div style="border-bottom: 1px solid var(--border-medium)" />
              <div class="item">
                时区：{{ dateTimeConverterResult.timezone }}
              </div>
              <div style="border-bottom: 1px solid var(--border-medium)" />
              <div class="item">GMT：{{ dateTimeConverterResult.GMT }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 当前时间戳展示区 -->
      <div style="flex: 0.7; border-left: 1px solid var(--border-medium)">
        <div class="timestamp-content column">
          <div class="title column-center">
            <ClockCircleOutlined style="margin-right: var(--space-sm)" />当前
            Unix 时间戳
          </div>
          <div
            style="
              margin: var(--space-md) 0;
              height: 1px;
              background: var(--border-medium);
            "
          />
          <div class="timestamp column-center">
            <div class="column-center" style="width: 145px; margin: 0 15px">
              {{ currentTimestamp / 1000 }}
            </div>
          </div>
          <div
            style="
              margin: var(--space-md) 0;
              height: 1px;
              background: var(--border-medium);
            "
          />
          <div class="row">
            <a-button
              type="primary"
              size="large"
              @click="onCopyContent((currentTimestamp / 1000).toString())"
            >
              <CopyOutlined /> 复制
            </a-button>
            <a-button
              type="primary"
              size="large"
              ghost
              @click="isPaused = !isPaused"
              style="margin-left: var(--space-lg)"
            >
              <PlayCircleOutlined v-if="isPaused" />
              <PauseCircleOutlined v-else />
              {{ isPaused ? "开始" : "暂停" }}
            </a-button>
          </div>
          <div
            style="
              margin: var(--space-md) 0;
              height: 1px;
              background: var(--border-medium);
            "
          />
          <div>
            时间戳通常是指一个特定时间点相对于某个特定起始时间的表示，通常以秒为单位。它是一个数字，表示从某个固定的起始时间（通常是1970年1月1日UTC，也称为UNIX纪元）到特定时间的经过的秒数。这个时间戳的计算方式称为UNIX时间戳。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="css">
.timestamp-root {
  height: 100%;
}
.timestamp-body {
  margin-right: var(--space-lg);
  margin-bottom: var(--space-lg);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
}
.timestamp-operation {
  padding: var(--space-md);
}
.converter-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: var(--space-lg);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  .item {
    flex: 1;
    display: flex;
    align-items: center;
    padding-left: var(--space-lg);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
  }
}
.timestamp-content {
  padding: var(--space-lg);
  .title {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
  }
  .timestamp {
    margin: auto;
    padding: var(--space-lg) 0;
    border-radius: var(--radius-sm);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-2xl);
    color: var(--text-inverse);
    background: var(--brand-primary);
  }
}
</style>
