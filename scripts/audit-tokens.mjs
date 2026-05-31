#!/usr/bin/env node

function countTokens(text) {
  const words = text.match(/[a-zA-Z0-9_]+/g) || [];
  const chineseChars = text.match(/[\u4e00-\u9fff\uff00-\uffef]/g) || [];
  const other = text.replace(/[a-zA-Z0-9_\s]/g, '').replace(/[\u4e00-\u9fff\uff00-\uffef]/g, '').length;
  return Math.round(words.length * 1.3 + chineseChars.length * 0.6 + other * 0.25);
}

function hr() { console.log(''); }

// ============================================================
// 旧版本（优化前）
// ============================================================
const old_ask_guidelines = [
  `Use ask_user_question whenever the user's request is underspecified and you cannot proceed without concrete decisions — you can ask up to 4 questions per invocation.`,
  `Each question MUST have 2-4 options. Every option requires a concise label (1-5 words) and a description explaining what the choice means or its trade-offs. The user can additionally type a custom answer ("Type something." row is appended automatically to single-select questions) or pick "Chat about this" to abandon the questionnaire.`,
  `Set multiSelect: true when multiple answers are valid; this suppresses the "Type something." row. Provide an options[].preview markdown string when an option benefits from richer side-by-side context (mockups, code snippets, diagrams, configs) — single-select only. NOTE: any non-empty preview on a single-select question ALSO suppresses the "Type something." row (no room in the side-by-side layout); "Chat about this" remains the escape hatch. If you recommend a specific option, make it the first option and append "(Recommended)" to its label.`,
  "Do not stack multiple ask_user_question calls back-to-back — group all clarifying questions into one invocation.",
];
const old_conv15 = [
  "1. No default exports. Use named exports everywhere in server and client code.",
  "2. Operational env reads live only in packages/server/src/config.ts.",
  "3. All AgentSession interactions go through session-registry.ts.",
  "4. Routes are registered in index.ts only.",
  "5. All filesystem operations go through file-manager.ts or git-runner.ts.",
  "6. Traversal attempts return 403, not 500.",
  "7. Auth is global with explicit opt-out.",
  "8. Never return raw secrets.",
  "9. All config/data writes are atomic.",
  "10. React state goes through Zustand stores.",
  "11. All browser HTTP calls go through api-client.ts.",
  "12. SSE clients must handle snapshot first.",
  "13. Git command failures are user-visible results.",
  "14. Use structured route errors.",
  "15. Put git worktrees under .worktrees/.",
];
const old_docTable = `| If you are touching... | Read first |
|---|---|
| High-level architecture, repo layout, data flow, data models | architecture.md |
| Fastify server setup, route registration, auth hooks, config/env reads, SDK wiring | server.md |
| React components, Zustand stores, browser API calls, SSE client, themes, diff UI | client.md |
| REST routes, OpenAPI schemas, SSE event payloads, public/private route behavior | api.md |
| Sessions, prompt flow, resume/dispose/fork, attachments, pi SDK events, turn diffs | sessions.md |
| Env vars, CLI flags, PI_CONFIG_DIR, FORGE_DATA_DIR, backup import/export | config.md |
| File browser, workspace path validation, filesystem writes, git command wrapper | filesystem.md |
| Integrated terminal, PTY lifecycle, WebSocket auth, tab reattach | terminal.md |
| MCP registry, MCP custom tools, MCP truncation, MCP/tool overrides | mcp.md |
| Tests, test runner usage, contract changes, adding/updating integration tests | testing.md |
| Cutting a release, bumping versions, release notes, version bump PRs | releases.md |
| End-of-session PR description, handoff summary, merge-ready change report | prs.md |`;
const old_configOwn = `PI_CONFIG_DIR (default ~/.pi/agent) is pi SDK territory. Managed via config-manager.ts. FORGE_DATA_DIR (default ~/.huiyu-pi) is pi-forge territory.`;

// ============================================================
// 新版本（优化后）
// ============================================================
const new_ask_guidelines = [
  `Use ask_user_question when requirements are unclear — you can ask up to 4 questions per call. Each question needs 2-4 options with concise labels and descriptions.`,
  `Use multiSelect when multiple answers are valid. Use preview for side-by-side comparisons (single-select only). Group all clarifying questions into one invocation — do not stack calls back-to-back.`,
];
const new_conv5 = [
  "1. No default exports. Use named exports everywhere.",
  "2. Never return raw secrets.",
  "3. All filesystem operations go through file-manager.ts or git-runner.ts.",
  "4. All config/data writes are atomic.",
  "5. React state goes through Zustand stores.",
  "See docs/agent/architecture.md for the remaining conventions.",
];
const new_docTable = `Before making changes, read the relevant docs/agent/*.md for that area: architecture / server / client / api / sessions / config / filesystem / terminal / mcp / testing / releases / prs`;
const new_configOwn = `Config ownership: PI_CONFIG_DIR (default ~/.pi/agent) is pi SDK territory; FORGE_DATA_DIR (default ~/.huiyu-pi) is pi-forge territory.`;

// ============================================================
// 计算
// ============================================================
console.log('=== 优化前后 Token 节省对比 ===');
hr();

const old_ask = old_ask_guidelines.reduce((s, g) => s + countTokens(g), 0);
const new_ask = new_ask_guidelines.reduce((s, g) => s + countTokens(g), 0);
console.log(`1. ask_user_question 指南:`);
console.log(`   优化前: ${old_ask} tokens (4条)`);
console.log(`   优化后: ${new_ask} tokens (2条)`);
console.log(`   节省: ${old_ask - new_ask} tokens (${((1-new_ask/old_ask)*100).toFixed(0)}%)`);
hr();

const old_conv = old_conv15.reduce((s, g) => s + countTokens(g), 0);
const new_conv = new_conv5.reduce((s, g) => s + countTokens(g), 0);
console.log(`2. 编码约定:`);
console.log(`   优化前: ${old_conv} tokens (15条)`);
console.log(`   优化后: ${new_conv} tokens (5条 + 引用)`);
console.log(`   节省: ${old_conv - new_conv} tokens (${((1-new_conv/old_conv)*100).toFixed(0)}%)`);
hr();

const old_doc = countTokens(old_docTable);
const new_doc = countTokens(new_docTable);
console.log(`3. 必读文档映射表:`);
console.log(`   优化前: ${old_doc} tokens (12行表格)`);
console.log(`   优化后: ${new_doc} tokens (2行列表)`);
console.log(`   节省: ${old_doc - new_doc} tokens (${((1-new_doc/old_doc)*100).toFixed(0)}%)`);
hr();

const old_cfg = countTokens(old_configOwn);
const new_cfg = countTokens(new_configOwn);
console.log(`4. 配置目录说明:`);
console.log(`   优化前: ${old_cfg} tokens (独立段落)`);
console.log(`   优化后: ${new_cfg} tokens (合并到项目说明)`);
console.log(`   节省: ${old_cfg - new_cfg} tokens (${((1-new_cfg/old_cfg)*100).toFixed(0)}%)`);
hr();

const totalOld = old_ask + old_conv + old_doc + old_cfg;
const totalNew = new_ask + new_conv + new_doc + new_cfg;
console.log('='.repeat(50));
console.log('  总计');
console.log('='.repeat(50));
console.log(`  优化前合计: ${totalOld} tokens`);
console.log(`  优化后合计: ${totalNew} tokens`);
console.log(`  总计节省:   ${totalOld - totalNew} tokens (${((1-totalNew/totalOld)*100).toFixed(0)}%)`);
hr();

const fullOld = 2309; // 之前统计的默认上下文总token数
const fullNew = fullOld - (totalOld - totalNew);
console.log('  影响整体上下文大小:');
console.log(`  优化前全上下文: ~${fullOld} tokens`);
console.log(`  优化后全上下文: ~${fullNew} tokens`);
console.log(`  整体再节省: ${fullOld - fullNew} tokens (${((1-fullNew/fullOld)*100).toFixed(1)}%)`);
console.log(`  vs Codex/Claude Code: 节省 ${((1-fullNew/20000)*100).toFixed(1)}%`);
console.log(`  vs Cline: 节省 ${((1-fullNew/8000)*100).toFixed(1)}%`);
