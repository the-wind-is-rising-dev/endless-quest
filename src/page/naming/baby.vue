<script setup lang="ts">
import { ref } from "vue";
import { queryNamingBaseData } from "../../api/workflow";

const gender = ref<string>("none");
const birthday = ref<string>("");
const nameLength = ref<string>("none");

const cagegoryList = ref<string[]>(["全部"]);
const category = ref<string>("全部");
const authorList = ref<string[]>(["全部"]);
const author = ref<string>("全部");
const dynastyList = ref<string[]>(["全部"]);
const dynasty = ref<string>("全部");

function queryBaseData() {
  queryNamingBaseData(1, 1000).then((response: any) => {
    const data = JSON.parse(response.data);
    const result: any[] = data.result;
    let poetry_category_list: string[] = [];
    let poetry_author_list: string[] = [];
    let poetry_dynasty_list: string[] = [];
    for (const item of result) {
      poetry_category_list = [
        ...poetry_category_list,
        ...item.poetry_category.split("、").map((item: string) => item.trim()),
      ];
      const poetry_author = item.poetry_author
        .trim()
        .replace(/〔\S+?〕/, "")
        .replace(/\(\S+?\)/, "")
        .trim();
      poetry_author_list.push(poetry_author);
      const poetry_dynasty = item.poetry_author
        .trim()
        .replace(poetry_author, "")
        .replace(/\(\S+?\)/, "")
        .replace(/〔|〕/g, "")
        .trim();
      poetry_dynasty_list.push(poetry_dynasty);
    }
    cagegoryList.value = Array.from(
      new Set([...cagegoryList.value, ...poetry_category_list]).keys()
    );
    dynastyList.value = Array.from(
      new Set([...dynastyList.value, ...poetry_dynasty_list]).keys()
    );
    authorList.value = Array.from(
      new Set([...authorList.value, ...poetry_author_list]).keys()
    );
  });
}

// 初始化
function initialize() {
  queryBaseData();
}
initialize();
</script>

<template>
  <div class="baby-root column">
    <div class="baby-page column auto-fill">
      <!-- 生成按钮 -->
      <a-button
        class="generate-button"
        type="primary"
        size="large"
        style="position: fixed"
      >
        立即生成
      </a-button>
      <!-- 信息设置 -->
      <div class="row auto-fill">
        <!-- 基础信息 -->
        <div class="setting-page column auto-fill">
          <div class="title">基础信息</div>
          <!-- 姓氏 -->
          <div class="row column-center">
            <div class="subtitle row">
              姓氏
              <div style="margin-top: -5px; color: var(--status-error)">*</div>
              ：
            </div>
            <a-input
              placeholder="请输入姓氏"
              style="width: 220px"
              maxlength="2"
              size="large"
            />
          </div>
          <div style="height: var(--space-md)" />
          <!-- 性别 -->
          <div class="row column-center">
            <div class="subtitle">性别：</div>
            <a-radio-group size="large" v-model:value="gender">
              <a-radio value="boy">男宝</a-radio>
              <a-radio value="girl">女宝</a-radio>
              <a-radio value="none">不限</a-radio>
            </a-radio-group>
          </div>
          <div style="height: var(--space-md)" />
          <!-- 字数 -->
          <div class="row column-center">
            <div class="subtitle">字数：</div>
            <a-radio-group size="large" v-model:value="nameLength">
              <a-radio value="1">单字</a-radio>
              <a-radio value="2">双字</a-radio>
              <a-radio value="none">不限</a-radio>
            </a-radio-group>
          </div>
          <div style="height: var(--space-md)" />
          <!-- 出生日期 -->
          <div class="row column-center">
            <div class="subtitle">出生日期：</div>
            <a-date-picker
              show-time
              :showNow="false"
              placeholder="选择日期/时间"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              v-model:value="birthday"
              size="large"
              style="width: 220px"
            />
          </div>
          <div style="height: var(--space-md)" />
          <!-- 忌讳字 -->
          <div class="row column-center">
            <div class="subtitle">忌讳字：</div>
            <a-input
              placeholder="请输入忌讳字"
              style="width: 220px"
              size="large"
            />
          </div>
        </div>
        <!-- 来源设置 -->
        <div class="setting-page column auto-fill" style="overflow: auto">
          <div class="title">来源偏好</div>
          <div class="preference row">
            <div class="center" style="height: 34px">类型：</div>
            <a-button
              v-for="item in cagegoryList"
              class="item"
              :type="category === item ? 'primary' : 'dashed'"
              ghost
              @click="(category = item), (author = '全部'), (dynasty = '全部')"
            >
              {{ item }}
            </a-button>
          </div>
          <div style="height: var(--space-md)" />
          <div class="preference row">
            <div class="center" style="height: 34px">作者：</div>
            <a-button
              v-for="item in authorList"
              class="item"
              :type="author === item ? 'primary' : 'dashed'"
              ghost
              @click="(author = item), (category = '全部'), (dynasty = '全部')"
            >
              {{ item }}
            </a-button>
          </div>
          <div style="height: var(--space-md)" />
          <div class="preference row">
            <div class="center" style="height: 34px">朝代：</div>
            <a-button
              v-for="item in dynastyList"
              class="item"
              :type="dynasty === item ? 'primary' : 'dashed'"
              ghost
              @click="(dynasty = item), (author = '全部'), (category = '全部')"
            >
              {{ item }}
            </a-button>
          </div>
        </div>
      </div>
      <!-- 结果展示页面 -->
      <div class="result-page"></div>
    </div>
  </div>
</template>

<style scoped lang="css">
.baby-root {
  width: 100%;
  height: 100%;
}
.baby-page {
  margin-right: var(--space-lg);
  border: 1px solid var(--border-medium);
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: var(--radius-md);
}
.generate-button {
  right: var(--space-lg);
  height: 40px;
}
.setting-page {
  margin: var(--space-md);
  padding: var(--space-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  .title {
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-lg);
    margin-bottom: var(--space-sm);
  }
  .subtitle {
    width: 80px;
    font-size: var(--font-size-md);
  }
  .preference {
    flex-wrap: wrap;
    flex-shrink: 0;
    .item {
      margin-right: var(--space-xs);
      margin-bottom: var(--space-sm);
    }
  }
}
.result-page {
}
</style>
