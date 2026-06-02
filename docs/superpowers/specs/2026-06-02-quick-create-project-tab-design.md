# 快速创建项目 Tab

## 目标

在 ProjectPicker 弹窗中增加一个"快速创建"tab，默认选中，让用户输入项目名称后一键完成创建，无需手动浏览文件夹。

## 样式变化

Tab 栏从两个变为三个，顺序为：

```
[快速创建]  [Create / pick folder]  [Clone repository]
```

"快速创建"为默认选中 tab。

## "快速创建"tab 的表单内容

- 顶部显示说明文字：`新建的项目会在此目录下自动创建一个文件夹来存放。`
- 说明文字下方显示 workspace 完整路径（如 `~/.huiyu-pi/workspace/`），来自 `ui-config.workspaceRoot`
- 路径下方是项目名称输入框
- 按钮文字：`创建项目（自动创建文件夹）`

## 交互流程

1. 弹窗打开 → 默认选中"快速创建"tab
2. 用户输入项目名称 → 点击"创建项目（自动创建文件夹）"按钮
3. 前端依次调用：
   - `POST /api/v1/projects/browse/mkdir`（parentPath=workspaceRoot, name=项目名）
     - 若返回 409（已存在）→ 显示错误"该名称已存在，请换个名称"，不清空输入框
     - 若返回其他错误 → 显示对应错误提示
   - 成功后 `api.createProject(name, createdPath)` → 创建项目记录
4. 创建成功 → 自动关闭弹窗，store 已自动切换到新项目

## 与其他 tab 的关系

- 切换 tab 时保留已输入的名称（已有行为）
- 三个 tab 场景明确：
  - 快速创建：新项目用 workspace 标准路径，最快捷
  - Create / pick folder：需要选特定目录或已有目录
  - Clone repository：从 git 导入

## 涉及改动

纯前端，只改 `packages/client/src/components/ProjectPicker.tsx` 一个文件。

- 新增 `mode` 值：`"quick"`
- 新增 Step：始终为 `"name"`（快速创建不需要浏览步骤）
- 修改 `onSubmitName`：当 mode=quick 时走自动创建路径（mkdir + createProject）
- Tab 栏从两个改为三个
- 服务端无需改动
