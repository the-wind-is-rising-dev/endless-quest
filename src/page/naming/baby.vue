<script setup lang="ts">
import { ref } from "vue";
import { generateBabyName } from "../../api/workflow";
import { message } from "ant-design-vue";

const familyName = ref<string>("");
const gender = ref<"男" | "女" | "none">("none");
const birthday = ref<string>("");
const nameLength = ref<"1" | "2" | "none">("none");
const forbidWord = ref<string>("");
// 朝代
const dynastyList = ref<string[]>([
  "全部",
  "先秦",
  "两汉",
  "魏晋",
  "南北朝",
  "隋代",
  "唐代",
  "五代",
  "宋代",
  "金朝",
  "元代",
  "明代",
  "清代",
]);
const dynasty = ref<string>("全部");
// 分类
const categoryLimit = ref<number>(dynastyList.value.length);
const cagegoryList = ref<string[]>([
  "全部",
  "诗经",
  "乐府",
  "楚辞",
  "送别",
  "劝学",
  "边塞",
  "儿童",
  "春天",
  "夏天",
  "秋天",
  "冬天",
  "悲愤",
  "悼亡",
  "咏怀",
  "爱国",
  "思乡",
  "咏物",
  "爱情",
  "田园",
  "民歌",
  "民谣",
  "山水",
  "怀古",
  "咏史",
  "散文",
  "闺怨",
  "抒情",
  "赞美",
  "咏柳",
  "读书",
  "秋思",
  "哲理",
  "离别",
  "梅花",
  "叙事",
  "写雪",
  "写景",
  "月亮",
  "长诗",
  "励志",
  "战争",
  "荷花",
  "题画",
  "感恩",
  "动物",
  "散曲",
  "感怀",
  "饮酒",
  "落花",
  "桃花",
  "写雨",
  "青春",
  "写山",
  "劝学",
  "论诗",
  "游仙",
  "节日",
  "春节",
  "元宵节",
  "寒食节",
  "清明节",
  "端午节",
  "七夕节",
  "中秋节",
  "重阳节",
  "托物言志",
  "古文观止",
  "宋词精选",
  "小学古诗",
  "初中古诗",
  "高中古诗",
  "小学文言文",
  "初中文言文",
  "高中文言文",
  "唐诗三百首",
  "古诗三百首",
  "宋词三百首",
  "古诗十九首",
]);
const category = ref<string>("全部");
// 作者
const authorLimit = ref<number>(dynastyList.value.length);
const authorList = ref<string[]>([
  "全部",
  "李白",
  "杜甫",
  "苏轼",
  "王维",
  "杜牧",
  "陆游",
  "李煜",
  "元稹",
  "韩愈",
  "岑参",
  "齐己",
  "贾岛",
  "柳永",
  "曹操",
  "李贺",
  "曹植",
  "张籍",
  "孟郊",
  "皎然",
  "许浑",
  "罗隐",
  "贯休",
  "韦庄",
  "屈原",
  "王勃",
  "张祜",
  "王建",
  "晏殊",
  "岳飞",
  "姚合",
  "卢纶",
  "秦观",
  "钱起",
  "朱熹",
  "韩偓",
  "高适",
  "方干",
  "李峤",
  "赵嘏",
  "贺铸",
  "郑谷",
  "郑燮",
  "张说",
  "张炎",
  "白居易",
  "辛弃疾",
  "李清照",
  "刘禹锡",
  "李商隐",
  "陶渊明",
  "孟浩然",
  "柳宗元",
  "王安石",
  "欧阳修",
  "韦应物",
  "温庭筠",
  "刘长卿",
  "王昌龄",
  "杨万里",
  "诸葛亮",
  "范仲淹",
  "陆龟蒙",
  "晏几道",
  "周邦彦",
  "杜荀鹤",
  "吴文英",
  "马致远",
  "皮日休",
  "左丘明",
  "张九龄",
  "权德舆",
  "黄庭坚",
  "司马迁",
  "皇甫冉",
  "卓文君",
  "文天祥",
  "刘辰翁",
  "陈子昂",
  "纳兰性德",
]);
const author = ref<string>("全部");

// 结果
const isShowResult = ref<boolean>(false);
const historyList = ref<any[]>();
const resultList = ref<any[]>([]);

// 生成
function onGenerate() {
  if (!/[\u4e00-\u9fa5]+/.test(familyName.value)) {
    message.error("请输入中文");
    return;
  }
  message.loading("生成中", 0);
  generateBabyName({
    familyName: familyName.value,
    gender: gender.value,
    birthday: birthday.value,
    nameLength: nameLength.value,
    forbidWord: forbidWord.value,
    category: category.value,
    author: author.value,
    dynasty: dynasty.value,
    index: 0,
    size: 10,
  }).then((res) => {
    const data = JSON.parse(res.data);
    resultList.value = data.result;
    isShowResult.value = true;
    message.destroy();
    message.success("生成成功");
  });
}

// 初始化
function initialize() {}
initialize();
</script>

<template>
  <div class="baby-page column">
    <!-- 生成按钮 -->
    <a-button
      v-if="!isShowResult"
      class="generate-button"
      type="primary"
      size="large"
      style="position: fixed"
      @click="onGenerate"
    >
      立即生成
    </a-button>
    <!-- 信息设置 -->
    <div v-if="!isShowResult" class="setting-page row auto-fill">
      <!-- 基础信息 -->
      <div class="setting-item-page column auto-fill">
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
            v-model:value="familyName"
          />
        </div>
        <div style="height: var(--space-md)" />
        <!-- 性别 -->
        <div class="row column-center">
          <div class="subtitle">性别：</div>
          <a-radio-group size="large" v-model:value="gender">
            <a-radio value="男">男宝</a-radio>
            <a-radio value="女">女宝</a-radio>
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
            v-model:value="forbidWord"
          />
        </div>
      </div>
      <!-- 来源设置 -->
      <div class="setting-item-page column auto-fill">
        <div class="title">来源偏好</div>
        <div class="preference row">
          <div class="item center" style="height: 34px">类型：</div>
          <a-button
            v-for="item in cagegoryList.slice(0, categoryLimit)"
            class="item"
            :type="category === item ? 'primary' : 'dashed'"
            ghost
            @click="((category = item), (author = '全部'), (dynasty = '全部'))"
          >
            {{ item }}
          </a-button>
          <a-button
            type="link"
            class="item"
            @click="
              categoryLimit =
                cagegoryList.length === categoryLimit
                  ? dynastyList.length
                  : cagegoryList.length
            "
          >
            {{ cagegoryList.length === categoryLimit ? "收起" : "展开" }}
          </a-button>
        </div>
        <div class="item-border" />
        <div class="preference row">
          <div class="center item" style="height: 34px">作者：</div>
          <a-button
            v-for="item in authorList.slice(0, authorLimit)"
            class="item"
            :type="author === item ? 'primary' : 'dashed'"
            ghost
            @click="((author = item), (category = '全部'), (dynasty = '全部'))"
          >
            {{ item }}
          </a-button>
          <a-button
            type="link"
            class="item"
            @click="
              authorLimit =
                authorList.length === authorLimit
                  ? dynastyList.length
                  : authorList.length
            "
          >
            {{ authorList.length === authorLimit ? "收起" : "展开" }}
          </a-button>
        </div>
        <div class="item-border" />
        <div class="preference row">
          <div class="item center" style="height: 34px">朝代：</div>
          <a-button
            v-for="item in dynastyList"
            class="item"
            :type="dynasty === item ? 'primary' : 'dashed'"
            ghost
            @click="((dynasty = item), (author = '全部'), (category = '全部'))"
          >
            {{ item }}
          </a-button>
        </div>
      </div>
    </div>
    <!-- 结果展示页面 -->
    <div v-if="isShowResult" class="result-page column">
      <a-button
        type="primary"
        style="margin: var(--space-sm); width: 80px"
        @click="isShowResult = false"
      >
        返回
      </a-button>
      <div class="row auto-fill">
        <!-- 生成记录列表 -->
        <div class="history column auto-fill">
          <div v-for="history in historyList"></div>
        </div>
        <!-- 结果列表 -->
        <div class="result column auto-fill">
          <div class="name-result" v-for="item in resultList">
            <!-- 姓名 -->
            <div class="item">
              <span class="title">姓名：</span>
              <span class="family-name">{{ item.familyName }}</span>
              <span class="name">{{ item.name }}</span>
            </div>
            <!-- 适用性别 -->
            <div class="item">
              <span class="title">适用性别：</span>
              <span class="content">{{ item.gender }}</span>
            </div>
            <!-- 适用类型 -->
            <div class="item">
              <span class="title">适用类型：</span>
              <span class="content">{{ item.naming_types }}</span>
            </div>
            <!-- 来源 -->
            <div class="item">
              <span class="title">来源：</span>
              <span class="content" style="color: var(--brand-secondary)">
                {{ item.source }}
              </span>
            </div>
            <!-- 出处 -->
            <div class="item">
              <span class="title">出处：</span>
              <span class="content">《{{ item.poetry_name }}》</span>
            </div>
            <!-- 作者/朝代 -->
            <div class="item">
              <span class="title">作者/朝代：</span>
              <span class="content">{{ item.poetry_author }}</span>
            </div>
            <!-- 赏析 -->
            <div class="item">
              <span class="title">赏析：</span>
              <span class="content" style="color: var(--brand-secondary)">
                {{ item.shangxi }}
              </span>
            </div>
            <!-- 五行属性 -->
            <div class="item">
              <span class="title">五行属性：</span>
              <span class="content">{{ item.wuxing }}</span>
            </div>
            <!-- 八字补益 -->
            <div class="item">
              <span class="title">八字补益：</span>
              <span class="content">{{ item.eight_char_tips }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.baby-page {
  width: 100%;
  height: 100%;
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
  .setting-item-page {
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
        margin-top: var(--space-xs);
        margin-bottom: var(--space-xs);
      }
    }
    .item-border {
      margin-top: var(--space-sm);
      margin-bottom: var(--space-sm);
      width: 100%;
      height: 1px;
      background: var(--border-medium);
    }
  }
}
.result-page {
  .history {
  }
  .result {
    .name-result {
      margin: var(--space-md);
      padding: var(--space-sm);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      .item {
        margin: var(--space-xs);
        font-size: var(--font-size-lg);
        flex-wrap: wrap;
        .title {
          font-weight: var(--font-weight-bold);
        }
        .content {
          color: var(--text-secondary);
        }
        .family-name {
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-lg);
        }
        .name {
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-lg);
          color: var(--brand-primary);
        }
      }
    }
  }
}
</style>
