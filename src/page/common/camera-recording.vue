<script setup lang="ts">
import { message } from "ant-design-vue";
import { ref } from "vue";
import {
  VideoCameraOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";
import RecordRTC from "recordrtc";
import DateUtils from "../../utils/DateUtils";

// 获取屏幕宽高
const previewWidth = ref<number>(window.screen.width * 0.5);
const previewHeight = ref<number>(window.screen.height * 0.5);

// 视频对象
const videoRef = ref<HTMLVideoElement | null>(null);
// 媒体流
const mediaStream = ref<MediaStream | null>(null);
// 录制对象
const recorder = ref<RecordRTC | null>(null);
// 视频格式, 默认 mp4
const format = ref<
  | "audio/webm"
  | "audio/webm;codecs=pcm"
  | "video/mp4"
  | "video/webm"
  | "video/webm;codecs=vp9"
  | "video/webm;codecs=vp8"
  | "video/webm;codecs=h264"
  | "video/x-matroska;codecs=avc1"
  | "video/mpeg"
  | "audio/wav"
  | "audio/ogg"
  // | undefined
>("video/mp4");
// 录制得到的视频
const video = ref<any>();

/// 摄像头状态
const isCameraOn = ref<boolean>(false);
//  开启摄像头
async function onCameraOn() {
  if (isCameraOn.value) {
    message.info("摄像头已开启");
    return;
  }
  try {
    // 获取摄像头流
    mediaStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true, // 如果需要音频
    });

    // 将流绑定到 video 元素
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream.value;
    }

    isCameraOn.value = true;
    message.success("摄像头已开启");
  } catch (error) {
    message.error("获取摄像头失败: " + error);
    throw error;
  }
}
// 关闭摄像头
function onCameraOff() {
  if (!isCameraOn.value) {
    message.info("摄像头已关闭");
    return;
  }
  if (isRecording.value) {
    onRecordStop();
  }

  // 停止所有轨道
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => {
      track.stop();
    });
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }

  mediaStream.value = null;
  isCameraOn.value = false;
  message.success("摄像头已关闭");
}

/// 录制状态
const isRecording = ref<boolean>(false);
// 开始录制
function onRecordStart() {
  if (isRecording.value) {
    message.warning("视频录制中...");
    return;
  }
  if (!mediaStream.value) {
    message.warning("请先打开摄像头");
    return;
  }
  try {
    // 初始化 RecordRTC
    recorder.value = new RecordRTC(mediaStream.value, {
      type: "video",
      mimeType: format.value, // 或 'video/mp4'，但需要浏览器支持
      videoBitsPerSecond: 2500000, // 2.5 Mbps
      audioBitsPerSecond: 128000,
    });

    recorder.value.startRecording();

    isRecording.value = true;
    message.success("视频录制开始");
  } catch (error) {
    console.error("启动录制失败:", error);
  }
}
// 停止录制
function onRecordStop() {
  if (!isRecording.value || !mediaStream.value || !recorder.value) {
    message.warning("视频未录制");
    return;
  }

  recorder.value.stopRecording(() => {
    let blob = recorder.value?.getBlob();
    console.log("录制完成，文件大小:", blob?.size);
    // 生成视频 URL
    if (blob) {
      const a = document.createElement("a");
      a.href = video.value;
      a.download = `无尽求索-工具站.${format.value.split("/")[1]}`;
      a.click();

      message.success("视频录制结束");
    } else {
      message.error("录制失败");
    }
    isRecording.value = false;
    recorder.value = null;
  });
}
</script>

<template>
  <div class="camera-record column center">
    <!-- 操作区 -->
    <div class="camera-operation row" :style="`width: ${previewWidth}px;`">
      <div class="auto-fill center">
        <a-button
          v-if="!isCameraOn"
          class="bth"
          type="primary"
          ghost
          @click="onCameraOn()"
        >
          <VideoCameraOutlined />打开摄像头
        </a-button>
      </div>
      <div class="auto-fill center">
        <a-button
          v-if="isCameraOn && !isRecording"
          class="bth"
          type="primary"
          ghost
          @click="onRecordStart()"
        >
          <PlayCircleOutlined /> {{ video ? "重新录制" : "开始录制" }}
        </a-button>
      </div>
      <div class="auto-fill center">
        <a-button
          v-if="isCameraOn && isRecording"
          class="bth"
          type="primary"
          ghost
          @click="onRecordStop()"
        >
          <PauseCircleOutlined />停止录制
        </a-button>
      </div>
      <div class="auto-fill center">
        <a-button
          v-if="isCameraOn"
          class="bth"
          type="primary"
          ghost
          @click="onCameraOff()"
        >
          <CloseCircleOutlined />关闭摄像头
        </a-button>
      </div>
    </div>
    <!-- 画面显示区 -->
    <div
      class="camera-preview center"
      :style="`width: ${previewWidth}px; height:${previewHeight}px`"
    >
      <!-- <video ref="videoRef" class="video" autoplay playsinline muted /> -->
    </div>
  </div>
</template>

<style lang="css" scoped>
.camera-record {
  width: 100%;
  height: 100%;
}
.camera-operation {
  margin: var(--space-sm) 0;
  .bth {
    margin: var(--space-sm);
  }
}
.camera-preview {
  flex-shrink: 0;
  background-color: black;
  .video {
    width: 100%;
    height: 100%;
  }
}
</style>
