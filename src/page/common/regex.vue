<script setup lang="ts">
import { ref } from "vue";
import { CopyOutlined, CaretDownOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const regex = ref<string>("");
const regexFlag = ref<string>("g");
const isGlobal = ref<boolean>(true);
const isIgnoreCase = ref<boolean>(false);
const isMulti = ref<boolean>(false);
const inputContent = ref<string>("");
const matchResult = ref<string>();
const matchTextResult = ref<string>("");
const replaceCotent = ref<string>("");
const replaceResult = ref<string>("");
const commonRegex = ref<
  {
    title: string;
    regexList: {
      use: string;
      regex: string;
      example: string;
      desc: string;
    }[];
  }[]
>([
  {
    title: "一、校验数字的表达式",
    regexList: [
      { use: "用途", regex: "正则表达式", example: "示例", desc: "说明" },
      {
        use: "数字",
        regex: "^\\d+$",
        example: "12345",
        desc: "只允许非负整数（0或正整数）",
      },
      {
        use: "n位数字",
        regex: "^\\d{n}$",
        example: "1234 (n=4)",
        desc: "恰好 n 位数字",
      },
      {
        use: "至少n位数字",
        regex: "^\\d{n,}$",
        example: "12345 (n=3)",
        desc: "至少 n 位数字",
      },
      {
        use: "m-n位数字",
        regex: "^\\d{m,n}$",
        example: "1234 (m=2,n=4)",
        desc: "m 到 n 位数字",
      },
      {
        use: "零和非零开头数字",
        regex: "^(0|[1-9]\\d*)$",
        example: "0, 123",
        desc: "0 或非零开头的整数",
      },
      {
        use: "非零开头最多两位小数",
        regex: "^[1-9]\\d*(\\.\\d{1,2})?$",
        example: "12.34",
        desc: "正整数或带1-2位小数",
      },
      {
        use: "正负数带1-2位小数",
        regex: "^-?\\d+(\\.\\d{1,2})?$",
        example: "-12.34, 56.7",
        desc: "正负数，1-2位小数",
      },
      {
        use: "正数、负数、小数",
        regex: "^[-+]?\\d+(\\.\\d+)?$",
        example: "+12.3, -0.5",
        desc: "正负整数或小数",
      },
      {
        use: "两位小数正实数",
        regex: "^\\d+(\\.\\d{2})?$",
        example: "12, 12.34",
        desc: "正整数或两位小数",
      },
      {
        use: "1~3位小数正实数",
        regex: "^\\d+(\\.\\d{1,3})?$",
        example: "12.3, 12.345",
        desc: "正整数或1-3位小数",
      },
      {
        use: "非零正整数",
        regex: "^[1-9]\\d*$",
        example: "123",
        desc: "不含0的正整数",
      },
      {
        use: "非零负整数",
        regex: "^-[1-9]\\d*$",
        example: "-123",
        desc: "不含0的负整数",
      },
      {
        use: "非负整数",
        regex: "^\\d+$",
        example: "0, 123",
        desc: "0或正整数",
      },
      {
        use: "非正整数",
        regex: "^(-\\d+|0)$",
        example: "-123, 0",
        desc: "0或负整数",
      },
      {
        use: "非负浮点数",
        regex: "^\\d+(\\.\\d+)?$",
        example: "0, 12.3",
        desc: "0或正浮点数",
      },
      {
        use: "非正浮点数",
        regex: "^(-\\d+(\\.\\d+)?|0+(\\.0+)?)$",
        example: "-12.3, 0, 0.0",
        desc: "0或负浮点数",
      },
      {
        use: "正浮点数",
        regex: "^(([1-9]\\d*)|0)\\.\\d+$",
        example: "0.1, 12.3",
        desc: "大于0的浮点数",
      },
      {
        use: "负浮点数",
        regex: "^-(([1-9]\\d*)|0)\\.\\d+$",
        example: "-0.1, -12.3",
        desc: "小于0的浮点数",
      },
      {
        use: "浮点数",
        regex: "^-?\\d+(\\.\\d+)?$",
        example: "-12.3, 0, 45.6",
        desc: "正负浮点数",
      },
    ],
  },
  {
    title: "二、校验字符串的表达式",
    regexList: [
      { use: "用途", regex: "正则表达式", example: "示例", desc: "说明" },
      {
        use: "汉字",
        regex: "^[\\u4e00-\\u9fa5]+$",
        example: "你好世界",
        desc: "只允许汉字，长度至少1",
      },
      {
        use: "英文和数字",
        regex: "^[A-Za-z0-9]+$",
        example: "abc123",
        desc: "只允许英文和数字",
      },
      {
        use: "4-40位英文和数字",
        regex: "^[A-Za-z0-9]{4,40}$",
        example: "abc12345",
        desc: "4-40位英文和数字",
      },
      {
        use: "长度为3-20的所有字符",
        regex: "^.{3,20}$",
        example: "abc, 12345678901234567890",
        desc: "任意字符，3-20位",
      },
      {
        use: "26个英文字母",
        regex: "^[A-Za-z]+$",
        example: "abcXYZ",
        desc: "只允许大小写英文字母",
      },
      {
        use: "26个大写英文字母",
        regex: "^[A-Z]+$",
        example: "ABCXYZ",
        desc: "只允许大写英文字母",
      },
      {
        use: "26个小写英文字母",
        regex: "^[a-z]+$",
        example: "abcxyz",
        desc: "只允许小写英文字母",
      },
      {
        use: "数字、字母或下划线",
        regex: "^\\w+$",
        example: "abc_123",
        desc: "数字、字母或下划线",
      },
      {
        use: "3-20位数字、字母或下划线",
        regex: "^\\w{3,20}$",
        example: "abc_123",
        desc: "3-20位数字、字母或下划线",
      },
      {
        use: "中文、英文、数字、下划线",
        regex: "^[\\u4E00-\\u9FA5A-Za-z0-9_]+$",
        example: "你好abc_123",
        desc: "允许中英文、数字、下划线",
      },
      {
        use: "中文、英文、数字（不含下划线）",
        regex: "^[\\u4E00-\\u9FA5A-Za-z0-9]+$",
        example: "你好abc123",
        desc: "允许中英文、数字，不含下划线",
      },
      {
        use: "可输入除%&',;=?$\"等字符外的内容",
        regex: "^[^%&',;=?$\\x22]+$",
        example: "abc123!@#",
        desc: "	不含%&',;=?$\"等字符",
      },
      {
        use: "禁止输入含有~的字符",
        regex: "^[^~]+$",
        example: "abc123",
        desc: "不含~字符",
      },
    ],
  },
  {
    title: "三、特殊需求表达式",
    regexList: [
      { use: "用途", regex: "正则表达式", example: "示例", desc: "说明" },
      {
        use: "Email地址",
        regex: "^\\w+([-+.']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$",
        example: "test@mail.com",
        desc: "常用邮箱格式",
      },
      {
        use: "域名",
        regex:
          "[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\\.?",
        example: "www.example.com",
        desc: "支持多级域名",
      },
      {
        use: "Internet URL",
        regex: "^[a-zA-Z]+://[^\\s]+$",
        example: "https://abc.com",
        desc: "常用URL格式",
      },
      {
        use: "手机号码",
        regex:
          "^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\\d{8}$",
        example: "13812345678",
        desc: "中国大陆手机号",
      },
      {
        use: "电话号码（区号-号码）",
        regex: "^(\\d{3,4}-)?\\d{7,8}$",
        example: "010-12345678",
        desc: "区号可选",
      },
      {
        use: "国内电话号码",
        regex: "\\d{3}-\\d{8}|\\d{4}-\\d{7}",
        example: "021-12345678",
        desc: "常见座机格式",
      },
      {
        use: "支持分机号的电话",
        regex:
          "((\\d{11})|((\\d{7,8})|(\\d{3,4}-\\d{7,8})|(\\d{3,4}-\\d{7,8}-\\d{1,4})|(\\d{7,8}-\\d{1,4})))$",
        example: "010-12345678-123",
        desc: "支持分机号",
      },
      {
        use: "身份证号",
        regex: "(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}[\\dXx]$)",
        example: "110101199003071234",
        desc: "15/18位，末位可为X",
      },
      {
        use: "合法账号",
        regex: "^[a-zA-Z][a-zA-Z0-9_]{4,15}$",
        example: "abc_123",
        desc: "字母开头，5-16位",
      },
      {
        use: "密码（字母开头，6-18位）",
        regex: "^[a-zA-Z]\\w{5,17}$",
        example: "a12345_",
        desc: "字母开头，6-18位",
      },
      {
        use: "强密码（无特殊字符）",
        regex: "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,10}$",
        example: "Abc12345",
        desc: "8-10位，含大小写字母和数字",
      },
      {
        use: "强密码（可含特殊字符）",
        regex: "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,10}$",
        example: "Abc12345!",
        desc: "8-10位，含大小写字母、数字、特殊字符",
      },
      {
        use: "日期格式",
        regex: "^\\d{4}-\\d{1,2}-\\d{1,2}$",
        example: "2023-01-01",
        desc: "yyyy-mm-dd",
      },
      {
        use: "一年12个月",
        regex: "^(0?[1-9]|1[0-2])$",
        example: "01, 12",
        desc: "01-12或1-12",
      },
      {
        use: "一个月31天",
        regex: "^((0?[1-9])|((1|2)[0-9])|30|31)$",
        example: "01, 31",
        desc: "01-31或1-31",
      },
      {
        use: "钱的输入（整数）",
        regex: "^(0|[1-9][0-9]*)$",
        example: "10000",
        desc: "非负整数",
      },
      {
        use: "钱的输入（可负数）",
        regex: "^(0|-?[1-9][0-9]*)$",
        example: "-10000",
        desc: "允许负数",
      },
      {
        use: "钱的输入（小数）",
        regex: "^[0-9]+(\\.[0-9]{1,2})?$",
        example: "10000.00",
        desc: "最多两位小数",
      },
      {
        use: "钱的输入（带千分位）",
        regex: "^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\\.[0-9]{1,2})?$",
        example: "10,000.00",
        desc: "千分位支持",
      },
      {
        use: "xml文件",
        regex: "^([a-zA-Z]+-?)+[a-zA-Z0-9]+\\.[xX][mM][lL]$",
        example: "test-1.xml",
        desc: "xml文件名",
      },
      {
        use: "中文字符",
        regex: "[\\u4e00-\\u9fa5]",
        example: "汉",
        desc: "单个中文字符",
      },
      {
        use: "双字节字符",
        regex: "[^\\x00-\\xff]",
        example: "汉字，日文",
        desc: "非ASCII字符",
      },
      {
        use: "空白行",
        regex: "^\\s*$",
        example: "（空行）",
        desc: "匹配空白行",
      },
      {
        use: "HTML标记",
        regex: "<[^>]+>",
        example: "<div>",
        desc: "简单HTML标签",
      },
      {
        use: "首尾空白字符",
        regex: "^\\s*|\\s*$",
        example: "  abc  ",
        desc: "去除首尾空白",
      },
      {
        use: "腾讯QQ号",
        regex: "[1-9][0-9]{4,}",
        example: "10000",
        desc: "5位及以上数字",
      },
      {
        use: "中国邮政编码",
        regex: "[1-9]\\d{5}(?!\\d)",
        example: "100000",
        desc: "6位数字",
      },
      {
        use: "IPv4地址",
        regex:
          "((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})(\\.((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})){3}",
        example: "192.168.1.1",
        desc: "IPv4格式",
      },
    ],
  },
]);

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  if (!text) return text;
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
    "/": "&#x2F;",
  };
  return text.replace(/[&<>"'\/]/g, (s) => map[s]);
}

/**
 * 匹配结果变化
 */
function onRegexMatchChange() {
  replaceResult.value = "";
  if (!regex.value || regex.value === "") {
    matchResult.value = "正则表达式为空，请输入正则表达式";
    matchTextResult.value = "正则表达式为空，请输入正则表达式";
    return;
  }
  if (!inputContent.value || inputContent.value === "") {
    matchResult.value = "输入内容为空，请输入输入内容";
    matchTextResult.value = "输入内容为空，请输入输入内容";
    return;
  }
  try {
    const regexObj = new RegExp(regex.value, regexFlag.value);
    const resultList: { matched: string; index: number; groups: string[] }[] =
      [];
    let match = null;
    do {
      match = regexObj.exec(inputContent.value);
      if (null == match) {
        break;
      }
      resultList.push({
        matched: match[0],
        index: match.index,
        groups: match.slice(1),
      });
      // 防止无限循环（当正则可能匹配空字符串时）
      if (match.index === regexObj.lastIndex) {
        regexObj.lastIndex++;
      }
    } while (isGlobal.value);

    if (resultList.length > 0) {
      let startIndex: number = 0;
      let endIndex: number = 0;
      const matchResultList = [];
      for (let index = 0; index < resultList.length; index++) {
        const result = resultList[index];
        endIndex = result.index;
        matchResultList.push(
          inputContent.value
            .substring(startIndex, endIndex)
            .split("\n")
            .map((it) => `<span>${escapeHtml(it)}</span>`)
            .join("<br>")
        );
        matchResultList.push(
          '<span style="background: var(--bg-tertiary); padding: 0 var(--space-xs); border: 1px solid var(--brand-accent); border-radius: var(--radius-sm);">' +
            escapeHtml(result.matched).split("\n").join("<br>") +
            "</span>"
        );
        startIndex = endIndex + result.matched.length;
        if (index === resultList.length - 1) {
          matchResultList.push(
            inputContent.value
              .substring(startIndex)
              .split("\n")
              .map((it) => `<span>${escapeHtml(it)}</span>`)
              .join("<br>")
          );
        }
      }
      matchResult.value = matchResultList.join("");
      matchTextResult.value = `找到 ${resultList.length} 个匹配项:\n${resultList
        .map(
          (r, i) =>
            `${i + 1}、匹配结果：${r.matched}，匹配组结果：${
              r.groups && r.groups.length > 0 ? r.groups.join("、") : null
            }（位置: ${r.index}）`
        )
        .join("\n\n")}`;
    } else {
      matchResult.value = "未找到匹配项";
      matchTextResult.value = "未找到匹配项";
    }
  } catch (error) {
    const errorMessage = "正则表达式错误：" + error;
    matchResult.value = errorMessage;
    matchTextResult.value = errorMessage;
  }
}

const resultDivRef = ref<HTMLDivElement | null>(null);
// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  // 检测 Ctrl+A 或 Cmd+A (Mac)
  if ((event.ctrlKey || event.metaKey) && event.key === "a") {
    event.preventDefault(); // 阻止默认行为
    selectAllContent(resultDivRef.value!);
  }
};

// 全选内容函数
const selectAllContent = (element: HTMLElement) => {
  const range = document.createRange();
  range.selectNodeContents(element);

  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

// 让 div 能够获得焦点并触发全选
const focusResultDiv = () => {
  if (resultDivRef.value) {
    resultDivRef.value.focus();
  }
};

// 替换内容
function onReplaceInputContent() {
  if (!inputContent.value || inputContent.value === "") {
    message.warn("请输入带匹配内容");
    return;
  }
  if (!replaceCotent.value || replaceCotent.value === "") {
    message.warn("请输入替换文本");
    return;
  }
  if (!regex.value || regex.value === "") {
    message.warn("请输入正则表达式");
    return;
  }
  replaceResult.value = inputContent.value.replace(
    new RegExp(regex.value, regexFlag.value),
    replaceCotent.value
  );
}
// 复制内容
function onCopyContent(content: string) {
  navigator.clipboard.writeText(content);
  message.success("复制成功");
}

// 正则表达式标记改变
function onRegexFlagChange() {
  const flagList = [];
  if (isGlobal.value) {
    flagList.push("g");
  }
  if (isIgnoreCase.value) {
    flagList.push("i");
  }
  if (isMulti.value) {
    flagList.push("m");
  }
  regexFlag.value = flagList.join("");
  onRegexMatchChange();
}
// 初始化
function initialize() {
  onRegexFlagChange();
}
initialize();
</script>

<template>
  <div class="regex-root column">
    <div class="regex-body column">
      <!-- 简单通用正则表达式 -->
      <div class="row column-center" style="overflow-x: auto">
        <div class="row" style="flex-shrink: 0">常用正则表达式：</div>
        <a-button
          class="right-space-md"
          type="primary"
          @click="
            (regex = '\\d+'),
              (inputContent = 'HELLO WORLD!1234567890你好世界！'),
              onRegexMatchChange()
          "
        >
          匹配数字
        </a-button>
        <a-button
          class="right-space-md"
          type="primary"
          @click="
            (regex = '[A-Za-z]+'),
              (inputContent = 'HELLO WORLD!1234567890你好世界！'),
              onRegexMatchChange()
          "
        >
          匹配字母
        </a-button>
        <a-button
          class="right-space-md"
          type="primary"
          @click="
            (regex = '[\\u4e00-\\u9fa5]+'),
              (inputContent = 'HELLO WORLD!1234567890你好世界！'),
              onRegexMatchChange()
          "
        >
          匹配中文
        </a-button>
        <a-button
          class="right-space-md"
          type="primary"
          @click="
            (regex = '-?\\d+(\\.\\d+)?'),
              (inputContent = 'HELLO WORLD!1234.123你好世界！'),
              onRegexMatchChange()
          "
        >
          匹配浮点数
        </a-button>
        <a-button
          class="right-space-md"
          type="primary"
          @click="
            (regex = `^\\w+([-+.']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$`),
              (inputContent = '12345he@gmail.com'),
              onRegexMatchChange()
          "
        >
          匹配邮箱
        </a-button>
      </div>
      <div
        class="top-space-md"
        style="height: 1px; background: var(--border-medium)"
      />
      <!-- 正则表达式输入框 -->
      <div class="row column-center top-space-md">
        <a-input
          class="right-space-md"
          style="width: 60%"
          size="large"
          placeholder="请输入正则表达式"
          v-model:value="regex"
          addon-before="/"
          :addon-after="'/' + regexFlag"
          @change="onRegexMatchChange"
        />
        <a-dropdown placement="bottom" arrow>
          <a-button type="primary" class="right-space-lg">
            修饰符<CaretDownOutlined />
          </a-button>
          <template #overlay>
            <a-menu>
              <div class="column">
                <a-radio
                  style="margin: var(--space-md)"
                  v-model:checked="isGlobal"
                  @click="(isGlobal = !isGlobal), onRegexFlagChange()"
                >
                  全局搜索 -g
                </a-radio>
                <a-radio
                  style="margin: var(--space-xs) var(--space-md)"
                  v-model:checked="isIgnoreCase"
                  @click="(isIgnoreCase = !isIgnoreCase), onRegexFlagChange()"
                >
                  忽略大小写 -i
                </a-radio>
                <a-radio
                  style="margin: var(--space-md)"
                  v-model:checked="isMulti"
                  @click="(isMulti = !isMulti), onRegexFlagChange()"
                >
                  多行模式 -m
                </a-radio>
              </div>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <!-- 匹配内容输入框 -->
      <a-textarea
        class="top-space-md"
        v-model:value="inputContent"
        :rows="5"
        placeholder="输入待匹配内容"
        @change="onRegexMatchChange"
      />
      <!-- 匹配结果 -->
      <div
        class="match-result top-space-md"
        @keydown="handleKeydown"
        @click="focusResultDiv"
        tabindex="0"
        ref="resultDivRef"
        :style="`${
          matchResult && matchResult != '' ? '' : 'color: var(--text-tertiary)'
        }`"
      >
        <div v-if="!matchResult || matchResult == ''">
          匹配结果在输入文本中的所在位置
        </div>
        <div v-else v-html="matchResult"></div>
      </div>
      <!-- 匹配结果文本信息 -->
      <a-textarea
        class="top-space-md"
        v-model:value="matchTextResult"
        :rows="8"
        placeholder="匹配文本结果"
        readonly
      />
      <!-- 替换文本 -->
      <div class="row column-center top-space-md">
        <a-input
          class="right-space-md"
          style="width: 60%"
          size="large"
          placeholder="请输入正则表达式"
          v-model:value="replaceCotent"
          addon-before="替换文本"
        />
        <a-button type="primary" @click="onReplaceInputContent()">
          替换
        </a-button>
      </div>
      <!-- 替换结果 -->
      <a-textarea
        class="top-space-md"
        v-model:value="replaceResult"
        :rows="6"
        placeholder="替换结果"
        readonly
      />
      <!-- 常用正则表达式列表 -->
      <div></div>
      <!-- 特殊需求表达式 -->
      <div></div>
    </div>
    <div class="regex-info-body column">
      <div class="title">常用正则表达式</div>
      <div v-for="(item, index) in commonRegex" :key="index">
        <div class="subtitle">{{ item.title }}</div>
        <div class="content column">
          <div v-for="(it, idx) in commonRegex[index].regexList" :key="index">
            <div
              :class="`item row ${
                idx == 0 ? 'headline' : idx % 2 == 0 ? 'even' : ''
              }`"
            >
              <div class="cell" style="flex: 0.8">{{ it.use }}</div>
              <div style="width: 1px; background: var(--border-medium)" />
              <div class="cell" style="flex: 1">
                {{ it.regex }}
                <a-button
                  v-if="idx != 0"
                  type="primary"
                  size="small"
                  ghost
                  style="margin-left: var(--space-xs)"
                  @click="onCopyContent(it.regex)"
                >
                  <CopyOutlined />
                </a-button>
              </div>
              <div style="width: 1px; background: var(--border-medium)" />
              <div class="cell" style="flex: 0.6">{{ it.example }}</div>
              <div style="width: 1px; background: var(--border-medium)" />
              <div class="cell" style="flex: 1">{{ it.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.regex-root {
  width: 100%;
  height: 100%;
}
.regex-body {
  margin-right: var(--space-lg);
  padding: var(--space-md);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
}
.right-space-md {
  margin-right: var(--space-md);
}
.top-space-md {
  margin-top: var(--space-md);
}
.match-result {
  height: 200px;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  overflow: auto;
  outline: none; /* 移除默认焦点轮廓，可选 */
  cursor: text; /* 显示文本光标样式 */
  &:hover {
    border: 1px solid var(--brand-primary);
  }
  &:focus {
    border: 1px solid var(--brand-primary);
  }
}
.regex-info-body {
  margin: var(--space-lg) var(--space-lg) var(--space-lg) 0;
  padding-bottom: var(--space-md);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  .title {
    font-size: var(--font-size-lg);
    background: var(--bg-tertiary);
    padding: var(--space-md);
    border-top-left-radius: var(--radius-md);
    border-top-right-radius: var(--radius-md);
    border-bottom: 1px solid var(--border-medium);
  }
  .subtitle {
    margin: var(--space-md) var(--space-md) 0 var(--space-md);
    font-size: var(--font-size-2xl);
  }
  .content {
    margin: var(--space-xs) var(--space-md);
    border-left: 1px solid var(--border-medium);
    border-top: 1px solid var(--border-medium);
    border-right: 1px solid var(--border-medium);
    .item {
      border-bottom: 1px solid var(--border-medium);
      .cell {
        flex: 1;
        padding: var(--space-sm) var(--space-md);
      }
    }
    .headline {
      background: var(--bg-sidebar);
    }
    .even {
      background: var(--bg-secondary);
    }
  }
}
</style>
