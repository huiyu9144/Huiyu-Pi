# Huiyu Pi — 全方位推广方案

> 基于 GitHub 同类热门项目（Cline 49k⭐、Aider 41k⭐、Continue 20k⭐、pi 54k⭐、OpenHands 等）的推广策略深度分析制定。

---

## 一、竞品推广策略核心发现

### 各项目最值得借鉴的"一招鲜"

| 项目 | Stars | 最值得借鉴的推广策略 | 核心启示 |
|------|-------|---------------------|---------|
| **Aider** | 41k⭐ | **用户证言墙** — 30+ 条带来源链接的真实评价 | 社会证明是最高 ROI 的推广手段 |
| **Cline** | 49k⭐ | **SDK 开放生态** — 从工具升级为平台，形成生态锁定 | 让开发者基于你的工具构建工具 |
| **pi** | 54k⭐ | **哲学化反向营销** — "What we didn't build" | 不做什么比做什么更能定义品牌 |
| **Aider** | 41k⭐ | **LLM 排行榜** — 自建行业评测标准，获取搜索流量 | 把自己变成行业参照物 |
| **Roo Code** | - | **18+ 语言国际化** — 降低非英语用户门槛 | 但缺乏商业模式最终关闭——推广不能替代商业闭环 |
| **OpenHands** | - | **开源+企业版双轨制** — MIT 开源获社区，企业版创收 | 社区与商业可以共存 |
| **Windsurf** | 闭源 | **融资/收购新闻 PR** — 利用资本事件获取免费全球曝光 | 商业化本身也是一种品牌信号 |

### 关键数据指标参考

| 项目 | GitHub Stars | 安装量/下载量 | Release 数 | Commits | 社区渠道 |
|------|-------------|--------------|-----------|---------|---------|
| Cline | 49k+ | 3.3k 项目依赖 | 271 | 6,004 | Discord + Reddit r/cline |
| Aider | 41k+ | PyPI 6.8M+ | - | - | Discord + Blog |
| Continue | 20k+ | VS Code 扩展 | 822 | 21,498 | GitHub Discussions |
| pi | 54k+ | npm 包 | 225 | 4,370 | Discord |

---

## 二、Huiyu Pi 现状诊断

### 已有优势
- ✅ 中英文双版本 README，带语言切换
- ✅ 品牌 logo + GIF 演示动图 + 4 张功能截图
- ✅ Discord 社区已创建
- ✅ MIT License + Release 徽章
- ✅ 核心差异化清晰：零上下文、本地部署、多 LLM 支持、纯 Web
- ✅ 已有 SEO_KEYWORDS.md 和 launch-checklist.md

### 需要补强的短板
- ⬜ 缺少**用户证言/社会证明**收集机制
- ⬜ 缺少**技术博客**内容输出
- ⬜ 官网过于简单（目前仅有 GitHub Pages）
- ⬜ 无 **Twitter/X** 社交账号（或已有但未在 README 中突出）
- ⬜ 无 **Product Hunt** 页面
- ⬜ 缺少**视频演示**（YouTube / B站）
- ⬜ 缺少**数据徽章**（安装量、下载量等量化数据）
- ⬜ ⭐ 数还在个位数（目前约 0-10），缺少社会证明
- ⬜ 缺少国际化（仅中英文）
- ⬜ 无 LLM 排行榜/评测数据

---

## 三、推广策略全景图

### 🎯 核心定位（一句话）
> **零上下文的本地 AI 编程助手 WebUI — 比 Codex/Claude Code 快数倍，完全自托管，支持所有主流 LLM。**

### 差异化卖点（对标竞品）
| 维度 | Cline | Aider | Codex/Claude Code | **Huiyu Pi** |
|------|-------|-------|-------------------|--------------|
| 部署方式 | VS Code 扩展 + CLI | 终端 CLI | 终端 CLI | **浏览器 WebUI** |
| 上下文大小 | 中等 | 中等 | ~20K tokens | **接近于零** |
| 隐私安全 | 部分本地 | 本地 | API 到云端 | **完全本地** |
| 安装复杂度 | 需安装 VS Code | pip 安装 | npm 安装 | **npx 一行命令** |
| 多 LLM 支持 | ✅ | ✅ | ❌ 绑定单一 | **✅ 全支持** |
| 文件管理 | 依赖 IDE | 无 | 无 | **内置浏览器+编辑器** |
| 集成终端 | VS Code 终端 | 自身终端 | 自身终端 | **xterm.js Web 终端** |
| 移动端 | ❌ | ❌ | ❌ | **✅ PWA 支持** |

---

## 四、分阶段推广执行方案

### 第一阶段：地基建设（D-14 到 D-1）— 当前阶段

#### 1.1 GitHub 仓库打磨（最高优先级）

| 任务 | 参考对象 | 具体操作 |
|------|---------|---------|
| **数据徽章展示** | Aider | 在 README 顶部添加 PyPI 下载量、npm 安装量、每周 Token 消耗等数据的 Badge |
| **新增"零上下文"对比表** | pi "What we didn't build" | 在 README 中增加与 Codex/Claude Code 的上下文大小对比图，用可视化方式展示差距 |
| **用户证言征集入口** | Aider | 在 README 中增加 "What people are saying" 区域（先放空，引导用户去 Discord 或 GitHub Issues 留言） |
| **新增安全/隐私对比表** | pi-forge | 强调"本地部署"与云端工具的数据安全性对比，用表格呈现 |
| **贡献指南完善** | Cline | 完善 CONTRIBUTING.md，增加开发环境搭建步骤（已有部分，需补充代码规范、PR 流程等） |
| **Issue/PR 模板** | Cline | bug_report.md 和 feature_request.md 已存在，确保模板质量 |
| **视频演示** | 所有竞品 | 录制 60-90 秒产品演示视频，上传到 YouTube 和 B站，嵌入 README |
| **国际化 README** | Roo Code（18 种语言） | 按优先级补充：日语、韩语、西班牙语（覆盖 GitHub 上活跃的非英语开发者） |

#### 1.2 社会证明积累（发布前最重要工作）

> Aider 花了大量精力收集用户证言，这是其 README 中最具说服力的部分。

| 方法 | 操作 |
|------|------|
| **内部测试 + 邀请内测** | 邀请 10-20 位开发者（Discord 成员、朋友、同事）内测，收集反馈并转化为证言 |
| **GitHub Issues 引导** | 在 Issues 模板中增加 "Share your experience" 选项，让用户自发留言 |
| **Discord 社区运营** | 在 Discord 中建立 #testimonials 频道，鼓励用户分享使用体验 |
| **视频截图证言** | 录制几个典型场景的使用录屏，展示"零上下文"的实际效果 |

#### 1.3 内容资产准备

| 内容类型 | 数量 | 用途 | 参考对象 |
|---------|------|------|---------|
| **技术博客文章** | 2-3 篇 | Dev.to / 掘金 / 知乎发布 | Aider Blog |
| **Twitter/X Thread** | 3-5 条 | 发布日使用 | Cline 推广 |
| **小红书图文笔记** | 2-3 篇 | 中文用户 | - |
| **短视频（60-90s）** | 1-2 个 | YouTube / B站 | 所有竞品 |
| **产品介绍截图集** | 1 套 | Product Hunt | - |
| **FAQ 文档** | 1 份 | 减少重复问答 | Aider FAQ |

**博客文章选题建议：**
1. 《我是如何把 AI 编程助手的上下文从 20K 压缩到接近于零的》— 技术深度
2. 《从 0 搭建自己的 Harness 系统：为什么你应该放弃 Codex 和 Claude Code》— 观点
3. 《自托管 AI 编程工具对比：Huiyu Pi vs Cline vs Aider vs Continue》— 横向评测

---

### 第二阶段：发布日冲锋（D-Day）

#### 2.1 发布渠道执行时间线（北京时间）

| 时间 | 渠道 | 动作 | 优先级 |
|------|------|------|--------|
| **08:00** | **GitHub Release** | 发布 v1.0.0 Release，附详细的 Release Notes | 🔥 必须 |
| **09:00** | **Hacker News** | "Show HN: Huiyu Pi – Zero-context local AI coding agent WebUI" | 🔥 必须 |
| **10:00** | **Reddit r/selfhosted** | 「I built a self-hosted AI coding tool – near-zero context, 100% local」 | 🔥 必须 |
| **10:30** | **Reddit r/LocalLLaMA** | 「Local AI coding agent with WebUI – supports Claude, GPT, DeepSeek, Gemini」 | 🔥 必须 |
| **12:00** | **Product Hunt** | 预约周二发布，产品页面提前准备好 | ⭐ 强烈推荐 |
| **14:00** | **Twitter/X** | Thread 发布（6-8 条推文），附 GIF 动图 | ⭐ 强烈推荐 |
| **16:00** | **Dev.to** | 发布第一篇技术博客 | ⭐ 强烈推荐 |
| **20:00** | **V2EX** | 「分享创造」节点发帖（中文社区） | ⭐ 强烈推荐 |
| **21:00** | **掘金** | 发布中文版技术博客 | 📢 有余力再发 |
| **当日** | **Discord** | 在 #announcements 频道发布，鼓励成员转发 | 🔥 必须 |

#### 2.2 Hacker News 发布策略（最关键）

Hacker News 是开源项目冷启动的最重要渠道。参考 Aider、Cline 的成功经验：

**标题建议（测试 3 个版本）：**
- 版本 A: "Show HN: Huiyu Pi – Zero-context AI coding agent in your browser"
- 版本 B: "Show HN: I built a self-hosted alternative to Codex and Claude Code"
- 版本 C: "Show HN: A local AI coding agent that uses 90% less context than Cline"

**发布后黄金 2 小时操作：**
1. 第一条评论自己写：解释项目背景、动机、为什么做了这个而不是用现有的
2. 回复每一条评论（前 2 小时内高频回复）
3. 准备好回答两类核心问题：
   - "和 Cline/Aider 有什么区别？" → 用对比表回答
   - "零上下文的具体含义？" → 用数据回答

**最佳发布时间：** 北京时间 21:00-23:00（美东时间 9-11 AM，周二到周四）

#### 2.3 Reddit 分发策略

| Subreddit | 标题策略 | 注意事项 |
|-----------|---------|---------|
| r/selfhosted | "Self-hosted" 关键词 + 隐私安全卖点 | 最精准的目标用户群 |
| r/LocalLLaMA | 多 LLM 支持 + 本地模型运行 | 技术向，强调支持本地模型 |
| r/programming | 与 Codex/Claude Code 对比 | 需要足够的技术深度 |
| r/opensource | MIT 开源 + 自托管 | 强调开源和自由 |

**Reddit 技巧：**
- 不同 subreddit 使用不同的标题和正文角度
- 附 GitHub 链接 + GIF 动图
- 评论区补充技术细节
- 回复所有评论

---

### 第三阶段：发布后跟进（D+1 到 D+30）

#### 3.1 每日必做清单

| 频次 | 任务 |
|------|------|
| 每日 | 回复所有 GitHub Issues 和 PR |
| 每日 | 回复所有社交媒体评论（HN、Reddit、Twitter） |
| 每日 | 监控 GitHub Stars 增长，记录关键节点 |
| 每 2 天 | 在 Discord 发布进度更新 |

#### 3.2 内容持续输出计划

| 时间 | 内容 | 渠道 |
|------|------|------|
| D+2 | 发布 HN/Reddit 复盘文章 | 博客 / Dev.to |
| D+3 | 发布 v1.0.1（修复发现的 bug） | GitHub |
| D+5 | 用户使用教程（从 0 到 1 搭建） | 掘金 / 知乎 / 博客 |
| D+7 | 首周数据总结（Stars、Issues、社区增长） | Twitter / Blog |
| D+10 | 深度技术文章：上下文压缩实践 | Dev.to / 掘金 |
| D+14 | 用户案例分享（邀请早期用户） | 博客 / 知乎 |
| D+21 | 对比评测：Huiyu Pi vs Cline vs Aider | 博客 / YouTube |
| D+30 | 首月里程碑总结 + 路线图更新 | GitHub Discussions |

#### 3.3 社区运营策略

| 事项 | 操作 |
|------|------|
| **Discord 活跃** | 每日至少回复 5 条消息，建立 #showcase 频道展示用户的用法 |
| **GitHub Discussions** | 开启 Discussions，分类为：Q&A、Show and tell、Ideas、Showcase |
| **贡献者激励** | 设置 "good first issue" 标签，吸引新贡献者 |
| **用户证言收集** | 在 Discord 建 #testimonials 频道，每周精选 1-2 条加到 README |

---

## 五、核心卖点文案库

### 英文
| 场景 | 文案 |
|------|------|
| **一句话** | A self-hosted AI coding agent with near-zero context. Built for speed, privacy, and freedom. |
| **差异化** | Unlike Codex/Claude Code that load 20K tokens of context, Huiyu Pi starts near zero. Faster responses, lower costs, better focus. |
| **隐私** | Your code, API keys, and conversations stay on YOUR machine. No cloud, no third party, no data leakage. |
| **多 LLM** | Bring your own API key for Claude, GPT, DeepSeek, Gemini... or run local models. Zero lock-in. |
| **WebUI** | Pure browser experience. No heavy IDE. Instant session switching, minimal memory footprint. |
| **开源** | MIT licensed. Build from scratch, customize everything, own your AI tools. |

### 中文
| 场景 | 文案 |
|------|------|
| **一句话** | 零上下文的本地 AI 编程助手 —— 比 Codex/Claude Code 快数倍，完全自托管。 |
| **差异化** | 其他工具加载 20K 上下文，Huiyu Pi 始于零。响应更快、成本更低、AI 更专注。 |
| **隐私** | 你的代码、API Key、对话全在本地。无云端、无第三方、无数据泄露。 |
| **多 LLM** | 自带 API Key，支持 Claude/GPT/DeepSeek/Gemini/本地模型，零绑定。 |
| **WebUI** | 纯浏览器体验，无需重型 IDE。会话瞬间切换，内存占用极低。 |
| **开源** | MIT 协议，从 0 搭建，完全自定义，完全掌控。 |

---

## 六、分渠道推广物料清单

### GitHub
- [ ] README 中英文双版本（已有 ✅）
- [ ] GIF 演示动图（已有 ✅）
- [ ] 4 张功能截图（已有 ✅）
- [ ] 数据徽章（需增加：npm 下载量、会话数等）
- [ ] 用户证言区域（需新增）
- [ ] 使用数据区域（需新增：当前版本、下载数等）
- [ ] GitHub Pages 官网（已存在 ✅）
- [ ] Social preview 图（需要制作）

### 社交媒体
- [ ] Twitter/X 账号 → 发布 Thread
- [ ] Product Hunt 页面 → 提前注册
- [ ] YouTube 频道 → 上传演示视频
- [ ] B站账号 → 上传中文演示视频
- [ ] 小红书账号 → 图文笔记
- [ ] 知乎账号 → 问答 + 文章

### 技术社区
- [ ] Dev.to → 技术博客
- [ ] 掘金 → 中文技术博客
- [ ] V2EX → 「分享创造」节点
- [ ] 少数派 → 效率工具推荐
- [ ] SegmentFault → 文章/问答

### 内容资产
- [ ] 技术博客文章 × 3 篇
- [ ] 产品演示视频 × 1 个（60-90s）
- [ ] Twitter Thread 模板 × 3 条
- [ ] Reddit 帖子模板 × 4 条
- [ ] HN 发布帖模板 × 1 条
- [ ] FAQ 文档 × 1 份

---

## 七、关键指标追踪

### 里程碑目标

| 指标 | 首周目标 | 首月目标 | 首季目标 |
|------|---------|---------|---------|
| GitHub Stars | 50+ | 200+ | 500+ |
| GitHub Forks | 10+ | 30+ | 80+ |
| Discord 成员 | 30+ | 100+ | 300+ |
| npm 下载量 | 500+ | 2,000+ | 10,000+ |
| Hacker News 热度 | 进入 Top 50 | - | - |
| Product Hunt 排名 | Top 30 | - | - |
| 技术博客阅读量 | - | 5,000+ | 20,000+ |
| 贡献者数 | 2+ | 5+ | 15+ |

### 每日追踪指标

| 指标 | 数据来源 | 检查频率 |
|------|---------|---------|
| Star 增长数 | GitHub Insights | 每日 |
| Issues/PR 数 | GitHub | 每日 |
| Discord 活跃度 | Discord Analytics | 每日 |
| 网站访问量 | 自建或 GitHub Insights | 每周 |
| 社交媒体互动 | 各平台 | 每日 |
| npm 下载量 | npm | 每周 |

---

## 八、长期增长引擎（发布 1 个月后）

### 8.1 LLM 排行榜（学习 Aider）

Aider 通过自建 [LLM Leaderboards](https://aider.chat/docs/leaderboards/) 获取了大量搜索流量和行业话语权。

**Huiyu Pi 的具体做法：**
- 在官网增加 "Zero-Context Benchmark" 页面
- 测试不同 LLM 在"零上下文"条件下的编程能力排名
- 将排行榜作为官方工具，每月更新
- 让评测本身成为内容资产，吸引自然搜索流量

### 8.2 技术博客系列（学习 Cline + Aider）

建立有规律的博客输出节奏：

| 周期 | 主题方向 | 目标 |
|------|---------|------|
| 每周一篇 | 使用教程、最佳实践 | 降低用户上手门槛 |
| 每两周一篇 | 技术深度、架构解析 | 建立技术权威 |
| 每月一篇 | 横向评测、行业思考 | 获取外部流量 |

### 8.3 社区生态建设（学习 Cline SDK）

长期目标：从"一个工具"升级为"一个平台"。
- 开放 Skills/扩展机制
- 鼓励社区贡献 MCP 服务器集成
- 建立贡献者激励计划

### 8.4 SEO 持续优化

参考已有 [SEO_KEYWORDS.md](file:///c:/Users/Administrator/Desktop/111111/PC-WEB/pi-forge/SEO_KEYWORDS.md) 中定义的 40+ 个关键词，执行以下操作：
- 为每个目标关键词撰写一篇博客文章
- 在 README 和官网页面中自然融入关键词
- 鼓励社区用户写使用体验文章（外部链接即 SEO 外链）

### 8.5 病毒式传播机制

参考 pi 项目在 README 中嵌入"可玩 DOOM"的彩蛋策略：
- 在 WebUI 中隐藏一个小彩蛋（如一个可交互的经典小游戏）
- 制作"零上下文"效果对比的病毒视频
- 创建 "How many tokens does your IDE waste?" 之类的互动测试页面，用户输入 IDE 类型即可看到对比数据，自动生成分享卡片

---

## 九、风险与应对

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| HN 发布无人问津 | 中 | 高 | 准备备选标题，由社区成员在 2 小时后重新提交 |
| Reddit 帖子被删 | 低 | 中 | 熟悉各 subreddit 规则，避免过度推广 |
| Product Hunt 排名低 | 中 | 低 | 提前邀请 Discord 成员支持，降低预期 |
| 开源项目缺乏持续动力 | 高 | 高 | 建立 roadmap 和定期发布节奏，引入维护者 |
| 被竞品模仿核心功能 | 中 | 中 | 持续创新，保持"零上下文"的领先优势 |

---

## 十、竞品推广策略精华总结

### 从 Cline（49k⭐）学到的
1. **多平台战略**：VS Code + JetBrains + CLI + Web + SDK，扩大用户触达面
2. **SDK 生态**：让开发者基于你的工具构建工具
3. **高频发布**：271 个 Release 展示极高活跃度
4. **社区建设**：Discord + Reddit 独立子版块双社区运营

### 从 Aider（41k⭐）学到的
1. **用户证言墙**：30+ 条精选评价，全部带原始链接可验证
2. **数据徽章**：6.8M 下载量、15B tokens/周——用数据说话
3. **LLM 排行榜**：自建行业标准，获取搜索流量
4. **Singularity 指标**："88% of new code written by Aider itself"——dogfooding 的极致展示
5. **独立网站**：aider.chat 而非 GitHub Pages

### 从 pi（54k⭐）学到的
1. **哲学化定位**："There are many agent harnesses, but this one is yours"——一句话定义品牌
2. **反向营销**：公开列出"我们不做什么"——在功能堆砌的市场中形成差异化
3. **个人品牌驱动**：作者 Mario Zechner 通过 X/Twitter 持续输出内容
4. **病毒彩蛋**：README 中嵌入可玩 DOOM 游戏
5. **独立域名**：pi.dev 提升品牌认知

### 从 Roo Code 学到的教训
1. **国际化有价值但不能解决根本问题**：18+ 语言翻译但最终关闭
2. **推广不能替代商业模式**：可持续的增长需要产品力 + 商业模式
3. **开源社区的碎片化风险**：关闭后社区分裂出 ZooCode

---

## 十一、总结与优先级排序

### 当前阶段（D-14 到 D-1）立即执行
1. **🔥 最高优先级**：在 README 中增加"零上下文"可视化对比 + 数据徽章
2. **🔥 最高优先级**：开始收集用户证言（Discord #testimonials 频道）
3. **🔥 最高优先级**：完善 CONTRIBUTING.md + PR 模板
4. **⭐ 高优先级**：录制产品演示视频，上传 YouTube/B站
5. **⭐ 高优先级**：准备 3 篇博客文章
6. **⭐ 高优先级**：注册 Product Hunt，准备发布页面

### 发布日（D-Day）执行
1. GitHub Release v1.0.0
2. Hacker News 发布（关键渠道）
3. Reddit 多 subreddit 分发
4. Twitter Thread 发布
5. Product Hunt 发布
6. 中文社区分发（V2EX、掘金）

### 发布后（D+1 到 D+30）执行
1. 每日社区互动（Issues、Discord、评论回复）
2. 每周至少一篇技术博客
3. 收集并展示用户证言
4. 监控数据指标，调整策略

---

*文档版本：v1.0 | 基于 2026 年 5 月 GitHub 市场调研*
