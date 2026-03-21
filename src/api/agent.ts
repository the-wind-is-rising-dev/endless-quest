import { postStream, ProcessStreamCallback } from "../utils/request";

export function subtitleTranslate(
  subtitle: string,
  auth: string,
  language: string,
  processStreamCallback: ProcessStreamCallback,
) {
  const headers = new Map();
  headers.set("Accept", "text/event-stream");
  headers.set("Content-Type", "application/json");
  headers.set("cors-url", "https://api.deepseek.com/chat/completions");
  auth = auth.startsWith("Bearer ") ? auth : "Bearer " + auth;
  headers.set("Authorization", auth);
  return postStream(
    process.env.NODE_ENV === "github-io"
      ? "https://cors-proxy.tight-firefly-4cb5.workers.dev/deepseek-api"
      : "/chat/completions",
    headers,
    {
      model: "deepseek-chat",
      stream: true,
      messages: [
        {
          role: "system",
          content: `你是一个专业的电影字幕翻译专家。你的任务是将用户提供的带有特殊标记的字幕文本翻译成${language}。请严格遵循以下要求：
保留标记：原文中的 #$#%#@# 标记是时间轴定位符，必须原样保留在译文中的对应位置，不得删除、修改或移动。
上下文连贯：翻译时需结合前后字幕的对话语境，确保人物语气、情感、口吻（如幽默、讽刺、正式、口语化等）自然连贯，符合电影场景。
信达雅原则：
信：准确传达原文语义，无错译、漏译。
达：译文通顺流畅，符合目标语言表达习惯，避免翻译腔。
雅：在准确与通顺基础上，兼顾文采与风格，必要时可进行艺术化处理，保留原句的节奏与韵味。
格式对应：输入文本中每行字幕（可能包含多句）与标记一一对应，输出时应保持相同的行结构和顺序，仅替换文本部分为翻译后的内容。`,
        },
        {
          role: "user",
          content: subtitle,
        },
      ],
    },
    processStreamCallback,
  );
}
