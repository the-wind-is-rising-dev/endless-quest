import { post } from "../utils/request";

/// 查询命名基础数据
export const queryNamingBaseData = (index: number, size: number = 10) => {
  return post(
    "https://coze-proxy.tight-firefly-4cb5.workers.dev/v1/workflow/run",
    {
      workflow_id: "7598799021291012123",
      parameters: {
        type: "base_data",
        index: index,
        size: size,
      },
    },
  );
};
