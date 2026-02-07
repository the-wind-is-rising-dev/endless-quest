import { post } from "../utils/request";

/// 查询命名基础数据
export const generateBabyName = (data: {
  familyName: string;
  gender: "男" | "女" | "none";
  birthday: string;
  nameLength: "1" | "2" | "none";
  forbidWord: string;
  category: string;
  author: string;
  dynasty: string;
  index: number;
  size: 10;
}) => {
  return post(
    "https://coze-proxy.tight-firefly-4cb5.workers.dev/v1/workflow/run",
    {
      workflow_id: "7598799021291012123",
      parameters: {
        type: "baby",
        ...data,
      },
    },
  );
};
