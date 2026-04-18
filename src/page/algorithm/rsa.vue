<script lang="ts" setup>
/**
 * RSA 加密/解密组件
 * 支持多种填充模式
 * 提供 Base64 和十六进制格式的输出
 */
import { message } from "ant-design-vue";
import { ref } from "vue";
import { MergeCellsOutlined, SplitCellsOutlined } from "@ant-design/icons-vue";
import * as forge from "node-forge";

/**
 * 填充模式选项
 */
const paddingOptions = [
  {
    value: "PKCS1",
    label: "PKCS1 - PKCS#1 v1.5 填充",
    description: "最常用的填充方式，适用于大多数场景",
  },
  {
    value: "OAEP",
    label: "OAEP - Optimal Asymmetric Encryption Padding",
    description: "更安全的填充方式，推荐使用",
  },
];

/**
 * 密钥长度选项
 */
const keyLengthOptions = [
  { value: 1024, label: "1024 位", description: "较低安全性，不推荐使用" },
  { value: 2048, label: "2048 位", description: "推荐使用的密钥长度" },
  { value: 4096, label: "4096 位", description: "高安全性，性能较低" },
];

// 内容列表
const contentList = ref<string[]>([""]);
// 公钥列表
const publicKeyList = ref<string[]>([""]);
// 私钥列表
const privateKeyList = ref<string[]>([""]);
// 输出结果列表（包含 Base64 和十六进制格式）
const outputList = ref<{ base64: string; hex: string; utf8: string }[]>([
  { base64: "", hex: "", utf8: "" },
]);
// 选择的填充模式列表
const selectedPaddingList = ref<string[]>(["PKCS1"]);
// 选择的密钥长度列表
const selectedKeyLengthList = ref<number[]>([2048]);
// 加密/解密模式列表
const isEncryptList = ref<boolean[]>([true]);

/**
 * 生成 RSA 密钥对
 * @param keyLength 密钥长度
 * @returns 包含公钥和私钥的对象
 */
function generateRSAKeyPair(keyLength: number): { publicKey: string; privateKey: string } {
  // 生成 RSA 密钥对
  const keyPair = forge.pki.rsa.generateKeyPair({
    bits: keyLength,
    e: 0x10001, // 65537
  });
  
  // 将公钥转换为 PEM 格式
  const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
  // 将私钥转换为 PEM 格式
  const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
  
  return { publicKey: publicKeyPem, privateKey: privateKeyPem };
}

/**
 * 为指定窗口生成 RSA 密钥对
 * @param index 窗口索引
 */
function generateKeyPair(index: number) {
  const keyLength = selectedKeyLengthList.value[index];
  const { publicKey, privateKey } = generateRSAKeyPair(keyLength);
  publicKeyList.value.splice(index, 1, publicKey);
  privateKeyList.value.splice(index, 1, privateKey);
  message.success("已生成 RSA 密钥对");
}

/**
 * 检查字符串是否为十六进制格式
 * @param str 要检查的字符串
 * @returns 是否为十六进制格式
 */
function isHexFormat(str: string): boolean {
  return /^[0-9a-fA-F]+$/.test(str);
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
  
  const content = contentList.value[index];
  const padding = selectedPaddingList.value[index];
  const isEncrypt = isEncryptList.value[index];
  
  let result = { base64: "", hex: "", utf8: "" };
  
  try {
    if (isEncrypt) {
      // 加密操作
      if (!publicKeyList.value[index]) {
        message.warning("请输入或生成公钥");
        return;
      }
      
      // 解析公钥
      const publicKey = forge.pki.publicKeyFromPem(publicKeyList.value[index]);
      
      // 计算密钥长度（字节）
      const keyLength = selectedKeyLengthList.value[index];
      const keyLengthBytes = keyLength / 8;
      
      // 计算最大明文长度
      let maxPlaintextLength: number;
      if (padding === "PKCS1") {
        // PKCS#1 v1.5 填充：密钥长度（字节） - 11
        maxPlaintextLength = keyLengthBytes - 11;
      } else { // OAEP
        // OAEP 填充（使用 SHA-256）：密钥长度（字节） - 2 * 哈希长度（32字节） - 2
        maxPlaintextLength = keyLengthBytes - 2 * 32 - 2;
      }
      
      // 计算明文长度（UTF-8 编码）
      const plaintextBytes = forge.util.encodeUtf8(content);
      const plaintextLength = plaintextBytes.length;
      
      // 验证明文长度
      if (plaintextLength > maxPlaintextLength) {
        message.error(`明文长度超过限制。当前长度: ${plaintextLength} 字节，最大长度: ${maxPlaintextLength} 字节。请使用更长的密钥或减少明文长度。`);
        return;
      }
      
      // 根据选择的填充模式进行加密
      let encryptedBytes: forge.Bytes;
      if (padding === "PKCS1") {
        encryptedBytes = publicKey.encrypt(plaintextBytes, "RSAES-PKCS1-V1_5");
      } else { // OAEP
        encryptedBytes = publicKey.encrypt(plaintextBytes, "RSA-OAEP", {
          md: forge.md.sha256.create(),
          mgf1: {
            md: forge.md.sha256.create(),
          },
        });
      }
      
      // 转换为 Base64 和十六进制格式
      result.base64 = forge.util.encode64(encryptedBytes);
      result.hex = forge.util.bytesToHex(encryptedBytes);
      result.utf8 = content;
    } else {
      // 解密操作
      if (!privateKeyList.value[index]) {
        message.warning("请输入或生成私钥");
        return;
      }
      
      // 解析私钥
      const privateKey = forge.pki.privateKeyFromPem(privateKeyList.value[index]);
      
      // 解析密文
      let encryptedBytes: forge.Bytes;
      if (isHexFormat(content)) {
        // 十六进制格式
        encryptedBytes = forge.util.hexToBytes(content);
      } else {
        // Base64 格式
        encryptedBytes = forge.util.decode64(content);
      }
      
      // 根据选择的填充模式进行解密
      let decryptedBytes: forge.Bytes;
      if (padding === "PKCS1") {
        decryptedBytes = privateKey.decrypt(encryptedBytes, "RSAES-PKCS1-V1_5");
      } else { // OAEP
        decryptedBytes = privateKey.decrypt(encryptedBytes, "RSA-OAEP", {
          md: forge.md.sha256.create(),
          mgf1: {
            md: forge.md.sha256.create(),
          },
        });
      }
      
      // 转换为 UTF-8 格式
      result.utf8 = forge.util.decodeUtf8(decryptedBytes);
      if (!result.utf8) {
        message.error("解密失败，请检查输入格式、密钥是否正确");
        return;
      }
      
      // 生成 Base64 和十六进制格式的明文
      result.base64 = forge.util.encode64(forge.util.encodeUtf8(result.utf8));
      result.hex = forge.util.bytesToHex(forge.util.encodeUtf8(result.utf8));
    }
  } catch (error) {
    console.error(isEncrypt ? '加密失败' : '解密失败', error);
    message.error(isEncrypt ? '加密失败' : '解密失败');
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
  publicKeyList.value.splice(index, 1);
  privateKeyList.value.splice(index, 1);
  outputList.value.splice(index, 1);
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
  publicKeyList.value.splice(index + 1, 0, publicKeyList.value[index]);
  privateKeyList.value.splice(index + 1, 0, privateKeyList.value[index]);
  outputList.value.splice(index + 1, 0, { base64: "", hex: "", utf8: "" });
  selectedPaddingList.value.splice(index + 1, 0, selectedPaddingList.value[index]);
  selectedKeyLengthList.value.splice(index + 1, 0, selectedKeyLengthList.value[index]);
  isEncryptList.value.splice(index + 1, 0, isEncryptList.value[index]);
  message.success("拆分成功");
}
</script>

<template>
  <div class="rsa-root row">
    <div
      class="rsa-container auto-fill column"
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
            style="width: 120px"
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
              ? '输入明文进行 RSA 加密'
              : '输入密文进行 RSA 解密'
          "
        />
      </div>

      <div class="row flex-wrap" style="margin: var(--space-md) 0">
        <div style="flex: 1; min-width: 200px; margin-right: var(--space-sm); margin-bottom: var(--space-sm)">
          <a-tooltip
            title="公钥 (PEM 格式)"
          >
            <a-textarea
              v-model:value="publicKeyList[index]"
              placeholder="公钥"
              style="width: 100%; height: 100px"
            />
          </a-tooltip>
        </div>
        <div style="flex: 1; min-width: 200px; margin-right: var(--space-sm); margin-bottom: var(--space-sm)">
          <a-tooltip
            title="私钥 (PEM 格式)"
          >
            <a-textarea
              v-model:value="privateKeyList[index]"
              placeholder="私钥"
              style="width: 100%; height: 100px"
            />
          </a-tooltip>
        </div>
        <div style="display: flex; align-items: flex-end; margin-bottom: var(--space-sm)">
          <a-button
            @click="generateKeyPair(index)"
            style="margin-right: var(--space-md)"
          >
            生成密钥对
          </a-button>
        </div>
      </div>

      <div class="row" style="margin-bottom: var(--space-md)">
        <a-button type="primary" ghost @click="onCalculate(index)">
          {{ isEncryptList[index] ? "RSA 加密" : "RSA 解密" }}
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
.rsa-root {
  width: 100%;
  height: 100%;
  flex-wrap: wrap;
}
.rsa-container {
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