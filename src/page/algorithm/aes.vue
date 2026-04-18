<script lang="ts" setup>
/**
 * AES 加密/解密组件
 * 支持多种加密模式、填充方式和密钥长度
 * 提供 Base64 和十六进制格式的输出
 */
import { message } from "ant-design-vue";
import { ref } from "vue";
import { MergeCellsOutlined, SplitCellsOutlined } from "@ant-design/icons-vue";
import CryptoJS from "crypto-js";

/**
 * 加密模式选项
 */
const modeOptions = [
  {
    value: "CBC",
    label: "CBC - 密码块链接模式",
    description: "将前一个密文块与当前明文块进行异或操作",
  },
  {
    value: "CFB",
    label: "CFB - 密码反馈模式",
    description: "将前一个密文块作为输入来生成密钥流",
  },
  {
    value: "CTR",
    label: "CTR - 计数器模式",
    description: "使用计数器生成密钥流",
  },
  {
    value: "OFB",
    label: "OFB - 输出反馈模式",
    description: "使用前一个输出作为输入来生成密钥流",
  },
  {
    value: "ECB",
    label: "ECB - 电子密码本模式",
    description: "每个明文块独立加密，不安全",
  },
];

/**
 * 填充方式选项
 */
const paddingOptions = [
  {
    value: "Pkcs7",
    label: "Pkcs7 - 最常用的填充方式",
    description: "填充值等于填充长度",
  },
  {
    value: "Iso97971",
    label: "Iso97971 - ISO 标准填充",
    description: "使用 0x80 后跟 0x00",
  },
  {
    value: "AnsiX923",
    label: "AnsiX923 - ANSI 标准填充",
    description: "使用 0x00 填充，最后一位为填充长度",
  },
  {
    value: "NoPadding",
    label: "NoPadding - 无填充",
    description: "要求明文长度为 16 字节的倍数",
  },
  {
    value: "ZeroPadding",
    label: "ZeroPadding - 零填充",
    description: "使用 0x00 填充",
  },
];

/**
 * 密钥长度选项
 */
const keyLengthOptions = [
  { value: 128, label: "128 位", description: "16 字节密钥" },
  { value: 192, label: "192 位", description: "24 字节密钥" },
  { value: 256, label: "256 位", description: "32 字节密钥" },
];

// 内容列表
const contentList = ref<string[]>([""]);
// 密钥列表
const keyList = ref<string[]>([""]);
// IV 向量列表
const ivList = ref<string[]>([""]);
// 输出结果列表（包含 Base64、十六进制和 UTF-8 格式）
const outputList = ref<{ base64: string; hex: string; utf8: string }[]>([
  { base64: "", hex: "", utf8: "" },
]);
// 选择的加密模式列表
const selectedModeList = ref<string[]>(["CBC"]);
// 选择的填充方式列表
const selectedPaddingList = ref<string[]>(["Pkcs7"]);
// 选择的密钥长度列表
const selectedKeyLengthList = ref<number[]>([128]);
// 加密/解密模式列表
const isEncryptList = ref<boolean[]>([true]);

/**
 * 生成随机密钥
 * @param length 密钥长度（字节）
 * @returns 十六进制格式的随机密钥
 */
function generateRandomKey(length: number): string {
  // 使用 CryptoJS 生成密码学安全的随机字节
  const keyBytes = CryptoJS.lib.WordArray.random(length);
  // 转换为十六进制字符串
  return keyBytes.toString(CryptoJS.enc.Hex);
}

/**
 * 生成随机 IV 向量
 * @returns 十六进制格式的 16 字节随机 IV
 */
function generateRandomIV(): string {
  // 生成 16 字节的随机 IV
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
}

/**
 * 为指定窗口生成随机密钥
 * @param index 窗口索引
 */
function generateKey(index: number) {
  const keyLength = selectedKeyLengthList.value[index];
  const key = generateRandomKey(keyLength / 8);
  keyList.value.splice(index, 1, key);
  message.success("已生成随机密钥");
}

/**
 * 为指定窗口生成随机 IV 向量
 * @param index 窗口索引
 */
function generateIV(index: number) {
  const iv = generateRandomIV();
  ivList.value.splice(index, 1, iv);
  message.success("已生成随机 IV 向量");
}

/**
 * 检查字符串是否为十六进制格式
 * @param str 要检查的字符串
 * @returns 是否为十六进制格式
 */
function isHexFormat(str: string): boolean {
  return /^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0;
}

/**
 * 执行加密或解密操作
 * @param index 窗口索引
 */
function onCalculate(index: number) {
  // 验证输入内容
  if (!contentList.value[index]) {
    message.warning("请输入内容");
    return;
  }
  if (!keyList.value[index]) {
    message.warning("请输入密钥");
    return;
  }

  // 验证密钥长度
  const key = keyList.value[index];
  const keyLength = selectedKeyLengthList.value[index];
  const expectedKeyLength = keyLength / 4; // 每个十六进制字符表示4位
  if (key.length !== expectedKeyLength) {
    message.error(
      `密钥长度不正确，${keyLength}位密钥需要${expectedKeyLength}个十六进制字符`,
    );
    return;
  }

  // 验证密钥是否为有效的十六进制格式
  if (!isHexFormat(key)) {
    message.error("密钥必须为十六进制格式");
    return;
  }

  // 验证 IV 向量
  let iv = ivList.value[index];
  const mode = selectedModeList.value[index];
  if (mode !== "ECB" && iv) {
    if (iv.length !== 32) {
      message.error("IV 向量长度不正确，需要32个十六进制字符");
      return;
    }
    if (!isHexFormat(iv)) {
      message.error("IV 向量必须为十六进制格式");
      return;
    }
  }

  const content = contentList.value[index];
  const padding = selectedPaddingList.value[index];
  const isEncrypt = isEncryptList.value[index];

  let result = { base64: "", hex: "", utf8: "" };

  try {
    // 解析十六进制密钥
    const keyBytes = CryptoJS.enc.Hex.parse(key);
    const keyWordArray = CryptoJS.lib.WordArray.create(
      keyBytes.words,
      keyLength / 8,
    );

    // 模式映射
    const modeMap: Record<string, any> = {
      CBC: CryptoJS.mode.CBC,
      CFB: CryptoJS.mode.CFB,
      CTR: CryptoJS.mode.CTR,
      OFB: CryptoJS.mode.OFB,
      ECB: CryptoJS.mode.ECB,
    };

    // 填充方式映射
    const paddingMap: Record<string, any> = {
      Pkcs7: CryptoJS.pad.Pkcs7,
      Iso97971: CryptoJS.pad.Iso97971,
      AnsiX923: CryptoJS.pad.AnsiX923,
      NoPadding: CryptoJS.pad.NoPadding,
      ZeroPadding: CryptoJS.pad.ZeroPadding,
    };

    if (isEncrypt) {
      // 非 ECB 模式下自动生成 IV
      if (mode !== "ECB" && !iv) {
        iv = generateRandomIV();
        ivList.value.splice(index, 1, iv);
        message.info("已自动生成 IV 向量");
      }
      // 解析十六进制 IV
      const ivWordArray = iv ? CryptoJS.enc.Hex.parse(iv) : undefined;
      // 加密
      const encrypted = CryptoJS.AES.encrypt(content, keyWordArray, {
        mode: modeMap[mode],
        padding: paddingMap[padding],
        iv: ivWordArray,
      });
      // 生成 Base64 和十六进制格式的密文
      result.base64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
      result.hex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
      result.utf8 = content;
    } else {
      // 解析密文（支持 Base64 和十六进制格式）
      let contentWordArray: any;
      if (isHexFormat(content)) {
        contentWordArray = CryptoJS.enc.Hex.parse(content);
      } else {
        contentWordArray = CryptoJS.enc.Base64.parse(content);
      }
      // 解析十六进制 IV
      const ivWordArray = iv ? CryptoJS.enc.Hex.parse(iv) : undefined;
      // 解密
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: contentWordArray } as any,
        keyWordArray,
        {
          mode: modeMap[mode],
          padding: paddingMap[padding],
          iv: ivWordArray,
        },
      );
      // 获取解密后的明文
      result.utf8 = decrypted.toString(CryptoJS.enc.Utf8);
      if (!result.utf8) {
        message.error("解密失败，请检查输入格式、密钥和 IV 是否正确");
        return;
      }
      // 生成 Base64 和十六进制格式的明文
      result.base64 = CryptoJS.enc.Base64.parse(result.utf8).toString(
        CryptoJS.enc.Base64,
      );
      result.hex = CryptoJS.enc.Utf8.parse(result.utf8).toString(
        CryptoJS.enc.Hex,
      );
    }
  } catch (error) {
    message.error("加密/解密失败");
    return;
  }

  outputList.value.splice(index, 1, result);
  message.success(isEncrypt ? "加密成功" : "解密成功");
}

/**
 * 合并窗口
 * @param index 要删除的窗口索引
 */
function onCompressCodemirror(index: number) {
  if (contentList.value.length <= 1) {
    message.warning("至少保留一个窗口");
    return;
  }
  contentList.value.splice(index, 1);
  keyList.value.splice(index, 1);
  ivList.value.splice(index, 1);
  outputList.value.splice(index, 1);
  selectedModeList.value.splice(index, 1);
  selectedPaddingList.value.splice(index, 1);
  selectedKeyLengthList.value.splice(index, 1);
  isEncryptList.value.splice(index, 1);
  message.success("删除成功");
}

/**
 * 拆分窗口
 * @param index 要拆分的窗口索引
 */
function onSplitCodemirror(index: number) {
  if (contentList.value.length >= 2) {
    message.warning("最多两个窗口");
    return;
  }
  contentList.value.splice(index + 1, 0, "");
  keyList.value.splice(index + 1, 0, keyList.value[index]);
  ivList.value.splice(index + 1, 0, ivList.value[index]);
  outputList.value.splice(index + 1, 0, { base64: "", hex: "", utf8: "" });
  selectedModeList.value.splice(index + 1, 0, selectedModeList.value[index]);
  selectedPaddingList.value.splice(
    index + 1,
    0,
    selectedPaddingList.value[index],
  );
  selectedKeyLengthList.value.splice(
    index + 1,
    0,
    selectedKeyLengthList.value[index],
  );
  isEncryptList.value.splice(index + 1, 0, isEncryptList.value[index]);
  message.success("拆分成功");
}
</script>

<template>
  <div class="aes-root row">
    <div
      class="aes-container auto-fill column"
      v-for="(_item, index) in contentList"
    >
      <div class="row flex-wrap" style="margin-bottom: var(--space-md)">
        <a-radio-group
          v-model:value="isEncryptList[index]"
          button-style="solid"
        >
          <a-radio-button :value="true">加密</a-radio-button>
          <a-radio-button :value="false">解密</a-radio-button>
        </a-radio-group>
        <div style="margin-left: var(--space-lg)">
          <span style="margin-right: var(--space-sm)">模式:</span>
          <a-select
            v-model:value="selectedModeList[index]"
            :options="modeOptions"
            style="width: 180px"
            show-search
            option-label-prop="label"
          />
        </div>
        <div style="margin-left: var(--space-md)">
          <span style="margin-right: var(--space-sm)">填充:</span>
          <a-select
            v-model:value="selectedPaddingList[index]"
            :options="paddingOptions"
            style="width: 180px"
            show-search
            option-label-prop="label"
          />
        </div>
        <div style="margin-left: var(--space-md)">
          <span style="margin-right: var(--space-sm)">密钥长度:</span>
          <a-select
            v-model:value="selectedKeyLengthList[index]"
            :options="keyLengthOptions"
            style="width: 100px"
            show-search
            option-label-prop="label"
          />
        </div>
      </div>

      <div class="auto-fill">
        <a-textarea
          v-model:value="contentList[index]"
          style="height: 100%"
          :placeholder="
            isEncryptList[index]
              ? '输入明文进行 AES 加密'
              : '输入密文进行 AES 解密'
          "
        />
      </div>

      <div class="row flex-wrap" style="margin: var(--space-md) 0">
        <div style="flex: 1; min-width: 200px; margin-right: var(--space-sm)">
          <a-tooltip
            :title="`密钥长度应与选择的密钥长度匹配（128位=32个十六进制字符，192位=48个十六进制字符，256位=64个十六进制字符）`"
          >
            <a-input
              v-model:value="keyList[index]"
              placeholder="密钥"
              style="width: 100%"
            />
          </a-tooltip>
        </div>
        <a-button
          @click="generateKey(index)"
          style="margin-right: var(--space-md)"
        >
          生成密钥
        </a-button>
        <div style="flex: 1; min-width: 200px; margin-right: var(--space-sm)">
          <a-tooltip
            title="IV 向量长度固定为 16 字节（32 个十六进制字符），仅非 ECB 模式需要"
          >
            <a-input
              v-model:value="ivList[index]"
              placeholder="IV 向量 (可选)"
              style="width: 100%"
            />
          </a-tooltip>
        </div>
        <a-button @click="generateIV(index)"> 生成 IV </a-button>
      </div>

      <div class="row" style="margin-bottom: var(--space-md)">
        <a-button type="primary" ghost @click="onCalculate(index)">
          {{ isEncryptList[index] ? "AES 加密" : "AES 解密" }}
        </a-button>
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
          v-if="contentList.length < 2"
          style="margin-left: var(--space-xs)"
          @click="onSplitCodemirror(index)"
        >
          <SplitCellsOutlined />
        </a-button>
      </div>

      <div class="auto-fill output-section">
        <template v-if="isEncryptList[index]">
          <div style="margin-bottom: var(--space-sm)">
            <span>Base64 格式:</span>
          </div>
          <a-textarea
            v-model:value="outputList[index].base64"
            :row="3"
            placeholder="此处显示 Base64 密文"
            readonly
            style="height: 80px; margin-bottom: var(--space-sm)"
          />
          <div style="margin-bottom: var(--space-sm)">
            <span>十六进制格式:</span>
          </div>
          <a-textarea
            v-model:value="outputList[index].hex"
            :row="3"
            placeholder="此处显示十六进制密文"
            readonly
            style="height: 80px"
          />
        </template>
        <template v-else>
          <div style="margin-bottom: var(--space-sm)">
            <span>解密结果:</span>
          </div>
          <a-textarea
            v-model:value="outputList[index].utf8"
            :row="6"
            placeholder="此处显示解密结果"
            readonly
            style="height: 160px"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.aes-root {
  width: 100%;
  height: 100%;
  flex-wrap: wrap;
}
.aes-container {
  margin-right: var(--space-lg);
  min-width: 400px;
  min-height: 500px;
}
.flex-wrap {
  flex-wrap: wrap;
}
.column {
  display: flex;
  flex-direction: column;
}
.auto-fill {
  flex: 1;
  min-height: 0;
}
.output-section {
  margin-bottom: var(--space-lg);
}
</style>
