# 消息级快照恢复 — 技术规格

> 将快照与对话消息绑定，恢复入口直接放在每条用户消息右上角，实现"回到某次提问时的项目状态"。

## 1. 设计目标

- 用户每次发送消息时自动创建一次快照（trigger = "pre-agent"）
- 每条用户消息气泡右上角显示恢复按钮（RotateCcw 图标）
- hover 恢复按钮，弹窗展示文件变更预览（新增/修改/删除）
- 点击按钮，弹出确认对话框，确认后执行恢复
- 移除独立的 SnapshotPanel 快照管理面板

## 2. 改动清单

### 2.1 删除

| 文件 | 说明 |
|------|------|
| `packages/client/src/components/SnapshotPanel.tsx` | 不再需要独立快照面板 |

### 2.2 修改

| 文件 | 改动 |
|------|------|
| `packages/server/src/snapshot-store.ts` | 新增 `computeDelta(snapshotId, currentTree)` 方法 |
| `packages/server/src/routes/snapshots.ts` | 新增 `GET /projects/:pid/snapshots/:sid/delta` 端点 |
| `packages/server/src/index.ts` | 无需改动（路由已在 snapshotRoutes 中） |
| `packages/client/src/components/FileBrowserPanel.tsx` | 移除 SnapshotPanel 的 import 和按钮 |
| `packages/client/src/lib/api-client/types.ts` | 新增 `SnapshotDelta`、`SnapshotDeltaEntry` 类型 |
| `packages/client/src/lib/api-client/index.ts` | 新增 `getSnapshotDelta`、`snapBeforeSend` API 方法 |
| `packages/client/src/store/snapshot-store.ts` | 新增 `snapBeforeSend`、`computeDelta` action |
| `packages/client/src/store/session-store.ts` | 新增 `snapshotIdByMessageIndex: Record<string, string>` 映射 |
| `packages/client/src/components/ChatView.tsx` | 用户消息气泡右上角：恢复按钮 + hover 弹窗 + 确认对话框 |

## 3. 数据模型

### 3.1 SnapshotDelta

```typescript
interface SnapshotDeltaEntry {
  path: string;
  status: "added" | "modified" | "deleted";
  snapshotSize: number;
  currentSize: number;
}

interface SnapshotDelta {
  snapshotId: string;
  snapshotLabel: string;
  entries: SnapshotDeltaEntry[];
  summary: {
    added: number;
    modified: number;
    deleted: number;
  };
}
```

### 3.2 消息→快照映射

在 `session-store.ts` 中：

```typescript
snapshotIdBySessionAndIndex: Record<string, string>;
// key = `${sessionId}::${messageIndex}`, value = snapshotId
```

## 4. 后端变更

### 4.1 `computeDelta` (snapshot-store.ts)

```typescript
export async function computeDelta(
  projectId: string,
  snapshotId: string,
  currentTree: TreeNode,
): Promise<SnapshotDelta>
```

逻辑：
1. 读取 manifest，获取快照文件列表
2. 用 `flattenTree(currentTree)` 获取当前文件列表
3. 三向对比：快照有/当前无 → added；都有/hash不同 → modified；当前有/快照无 → deleted
4. 返回 delta 对象

### 4.2 `GET /projects/:pid/snapshots/:sid/delta`

- 认证：继承项目级别认证
- 参数：projectId, snapshotId
- 响应：`{ delta: SnapshotDelta }`
- 错误：404（snapshot 不存在）

## 5. 前端变更

### 5.1 ChatView 用户消息改动

在现有用户消息气泡（L786-842）的标题栏中添加恢复按钮：

```
现有: [▾] you 14:30              [📋] [源码]
改为: [▾] you 14:30    [↺]    [📋] [源码]

注: [↺] 只有该消息关联了快照才显示
```

### 5.2 恢复按钮行为

- **hover**：请求 `/delta` 端点，弹出一个非模态 tooltip 展示文件变更预览
  - 新增文件标记为绿色 + 
  - 修改文件标记为黄色 ~
  - 删除文件标记为红色 -
- **click**：弹出 ConfirmDialog，显示变更摘要，确认后调用 restoreSnapshot

### 5.3 自动快照触发点

在 ChatView 的 ChatInput 提交时（或 session-store 的 sendMessage 中），先调用 `api.createSnapshot(projectId, label, "pre-agent")`，将返回的 snapshotId 存入 `snapshotIdBySessionAndIndex`。

## 6. UI 交互细节

### 6.1 Hover 弹窗

- 宽度：320px
- 最大高度：300px，超出可滚动
- 每行：状态图标 + 文件路径
- 底部：变更统计 `+2 ~3 -1`
- 弹出位置：按钮右下方
- 非模态（鼠标移出消失，300ms debounce）

### 6.2 确认对话框

- 标题："确认恢复到快照"
- 内容：快照标签 + 日期 + 变更摘要
- 警告文字："当前项目状态将自动保存为备份快照"
- 按钮：取消 / 确认恢复 (tone: danger)

## 7. 错误处理

| 场景 | 处理 |
|------|------|
| 快照不存在 | 隐藏恢复按钮 |
| delta 计算失败 | 按钮仍然显示（允许恢复），toast 提示 |
| 恢复失败 | 错误提示，不关闭对话框 |
| 项目路径不匹配 | 阻止恢复，显示错误 |

## 8. 与现有功能的兼容

- `snapshot-store.ts` 保留 create/list/restore/delete/getStorageInfo 方法不变
- `routes/snapshots.ts` 保留所有现有端点，仅新增 `/delta`
- 后端 `createSnapshot` 的自定义 label 参数全部保留
- 前端 Zustand store 保留现有 actions
