#!/usr/bin/env node

// Approximate token counter
function countTokens(text) {
  const words = text.match(/[a-zA-Z0-9_]+/g) || [];
  const chineseChars = text.match(/[\u4e00-\u9fff\uff00-\uffef]/g) || [];
  const other = text
    .replace(/[a-zA-Z0-9_\s]/g, "")
    .replace(/[\u4e00-\u9fff\uff00-\uffef]/g, "").length;
  return Math.round(words.length * 1.3 + chineseChars.length * 0.6 + other * 0.25);
}

function hr() {
  console.log("");
}

// ==============================
// PART 1: Pi SDK Base System Prompt (built by buildSystemPrompt)
// ==============================
const baseSystemPrompt = `You are an expert coding assistant operating inside pi, a coding agent harness. You help users by reading files, executing commands, editing code, and writing new files.

Available tools:
- read: Read file contents
- bash: Execute bash commands (ls, grep, find, etc.)
- edit: Make precise file edits with exact text replacement, including multiple disjoint edits in one call
- write: Create or overwrite files
- grep: Search file contents for patterns (respects .gitignore)
- find: Find files by glob pattern (respects .gitignore)
- ls: List directory contents
- ask_user_question: Ask the user up to 4 structured questions (2-4 options each) when requirements are ambiguous
- todo: Manage a task list for tracking larger multi-step progress
- process: Manage background processes without blocking the conversation

In addition to the tools above, you may have access to other custom tools depending on the project.

Guidelines:
- Be concise in your responses
- Show file paths clearly when working with files
- Use read to examine files instead of cat or sed.
- Use edit for precise changes (edits[].oldText must match exactly)
- When changing multiple separate locations in one file, use one edit call with multiple entries in edits instead of multiple edit calls
- Use write only for new files or complete rewrites.
- Do NOT call todo unless the work clearly has more than 3 distinct tasks (4+ tasks).
- When starting any task, mark it in_progress BEFORE beginning work.
- Never mark a task completed if tests are failing.
- Task status is a 4-state machine: pending to in_progress to completed, plus deleted.
- Use process tool for long-running commands instead of bash.
- Avoid shell background patterns such as &, nohup, disown, or setsid.
- After starting a process, continue other work instead of waiting.
- Use process tool notify flags and logWatches.

Pi documentation (read only when the user asks about pi itself):
- Main documentation, Additional docs, Examples
- When asked about extensions, themes, skills, prompt templates, TUI, etc.
- Always read pi .md files completely

Current date: 2026-05-31
Current working directory: /home/user/project`;

// ==============================
// PART 2: Agent context files (CLAUDE.md / AGENTS.md)
// ==============================
const agentsMd = `AGENTS.md - always-loaded entrypoint for coding agents.

What This Project Is: pi-forge is a browser UI for the pi coding agent. It is an HTTP server that embeds the pi-coding-agent SDK and exposes it to a browser over REST + SSE. Single-tenant by design.

Required Reading by Task table: 14 entries mapping task areas to docs/agent/*.md files.

Build & Dev Commands:
- npm install, npm run build, npm run dev, npm run check
- npx tsx tests/test-session.ts for single test
- Run Prettier before opening PR

Version Management (Important!):
- NEVER hand-edit version numbers
- Use release.bat <new-version> for automated bumping
- Safety checks: no version regression, no invalid SemVer, no dirty tree

Critical Conventions (15 rules):
1. No default exports. Use named exports everywhere.
2. Operational env reads live only in config.ts.
3. All AgentSession interactions go through session-registry.ts.
4. Routes registered in index.ts only.
5. All filesystem ops go through file-manager.ts or git-runner.ts.
6. Traversal attempts return 403, not 500.
7. Auth is global with explicit opt-out.
8. Never return raw secrets.
9. All config/data writes are atomic (tmp + rename).
10. React state goes through Zustand stores.
11. All browser HTTP calls go through api-client.ts.
12. SSE clients must handle snapshot first.
13. Git command failures return 200 with success:false, not 500.
14. Use structured route errors.
15. Put git worktrees under .worktrees/.

Config Ownership: PI_CONFIG_DIR (~/.pi/agent) vs FORGE_DATA_DIR (~/.huiyu-pi).

Pi SDK Facts (10 items): createAgentSession async, session.prompt resolves after full run, session.subscribe returns unsubscribe, fork vs navigateTree, etc.`;

// ==============================
// PART 3: Tool input JSON schemas (as seen by LLM)
// ==============================
const toolSchemas = `read: path(string), offset(number optional), limit(number optional)
bash: command(string), timeout(number optional)
edit: edits(array of {oldText:string, newText:string})
write: path(string), content(string)
grep: pattern(string), path(string optional), glob(string optional), ignoreCase(boolean optional), context(number optional), limit(number optional)
find: pattern(string), path(string optional), limit(number optional)
ls: path(string optional), limit(number optional)
ask_user_question: questions(array of {question:string, header:string, options:array of {label:string, description:string, preview:string optional}, multiSelect:boolean optional})
todo: action(string), subject(string), status(string), blockedBy(array optional), activeForm(string optional)
process: action(string), name(string), command(string), id(string), input(string), alertOnSuccess(boolean), alertOnFailure(boolean), logWatches(array)`;

// ==============================
// PART 4: Tool descriptions
// ==============================
const toolDescs = `read: Read file contents, supports text and images (jpg/png/gif/webp). Output truncated to 500 lines or 256KB.
bash: Execute bash commands with optional timeout. Returns stdout+stderr truncated to 500 lines or 256KB.
edit: Precise text replacement. edits[].oldText must match unique non-overlapping regions.
write: Create or overwrite files. Automatically creates parent directories.
grep: Search file contents for regex pattern. Respects .gitignore. Returns matches with file paths and line numbers.
find: Search files by glob pattern. Respects .gitignore. Returns matching paths.
ls: List directory contents. Includes dotfiles. Shows dirs with / suffix.

ask_user_question: Ask 1-4 structured questions. Each question has 2-4 options. Users can type custom answers or pick Chat about this. Supports multiSelect and preview. Do not stack calls back-to-back.

todo: Manage task list. Use only for 4+ tasks. Actions: create, update, list, get, delete, clear. Status: pending to in_progress to completed. Use blockedBy for dependencies. Subject must be short and imperative.

process: Manage background processes. Actions: start, list, output, logs, kill, clear, write. Use notify flags instead of polling. User sees updates in UI always.`;

// ==============================
// PART 5: FORGE_SECRET_HYGIENE_RULE (optional, off by default)
// ==============================
const secretRule = `When running shell commands on behalf of the user, treat the contents of environment variables as credentials by default. Do not echo, print, or paste env-var values into your responses or tool outputs unless the user has explicitly asked you to display that specific variable. Checking whether a variable is set is fine; printing the value is not. If you need to use a secret in a command, reference it by $NAME rather than expanding it inline. This rule applies even when debugging.`;

// ==============================
// PART 6: NUDGE_MESSAGE (only after compaction overflow)
// ==============================
const nudge = `[continuation] Continue the task in progress - pick up from where you left off based on the summary above. Do not write a status update or summary of what you were doing; just proceed with the next action the task requires.`;

// ==============================
// CALCULATE
// ==============================
console.log("=== 上下文 Token 统计报告 ===");
console.log("日期: 2026-05-31");
console.log("项目: Huiyu Pi (pi-forge)");
hr();

console.log("1. Pi SDK 基础 System Prompt");
const t1 = countTokens(baseSystemPrompt);
console.log(`   字符: ${baseSystemPrompt.length}, Token: ${t1}, 约 ${(t1 / 1000).toFixed(2)}K`);
hr();

console.log("2. Agent Context 文件 (CLAUDE.md / AGENTS.md)");
const t2 = countTokens(agentsMd);
console.log(`   字符: ${agentsMd.length}, Token: ${t2}, 约 ${(t2 / 1000).toFixed(2)}K`);
console.log("   (实际内容取决于项目目录下的 AGENTS.md 内容大小)");
hr();

console.log("3. 工具输入 Schema");
const t3 = countTokens(toolSchemas);
console.log(`   字符: ${toolSchemas.length}, Token: ${t3}, 约 ${(t3 / 1000).toFixed(2)}K`);
hr();

console.log("4. 工具描述文本");
const t4 = countTokens(toolDescs);
console.log(`   字符: ${toolDescs.length}, Token: ${t4}, 约 ${(t4 / 1000).toFixed(2)}K`);
hr();

console.log("5. FORGE_SECRET_HYGIENE_RULE (可选，默认关闭)");
const t5 = countTokens(secretRule);
console.log(`   字符: ${secretRule.length}, Token: ${t5}, 约 ${(t5 / 1000).toFixed(2)}K`);
console.log("   默认关闭，仅当 AGENT_SECRET_HYGIENE_RULE=true 时启用");
hr();

console.log("6. NUDGE_MESSAGE (仅溢出压缩后触发)");
const t6 = countTokens(nudge);
console.log(`   字符: ${nudge.length}, Token: ${t6}, 约 ${(t6 / 1000).toFixed(2)}K`);
console.log("   仅在 LLM 溢出自动压紧后触发，非每次会话都会加载");
hr();

console.log("========================================");
console.log("        分场景上下文大小汇总");
console.log("========================================");
hr();

const defaultTotal = t1 + t2 + t3 + t4;
const withSecret = defaultTotal + t5;

console.log("场景 A: 首次新会话（默认）");
console.log(`   1. System Prompt:     ${t1}`);
console.log(`   2. AGENTS.md:         ${t2}`);
console.log(`   3. 工具 Schema:       ${t3}`);
console.log(`   4. 工具描述:          ${t4}`);
console.log(`   ──────────────────────────────────`);
console.log(`   合计:                 ${defaultTotal} tokens`);
console.log(`   约:                   ${(defaultTotal / 1000).toFixed(1)}K tokens`);
hr();

console.log("场景 B: 首次新会话 + secret hygiene rule");
console.log(
  `   ${defaultTotal} + ${t5} = ${withSecret} tokens (${(withSecret / 1000).toFixed(1)}K)`,
);
hr();

console.log("场景 C: 溢出压缩恢复后");
console.log(
  `   ${defaultTotal} + ${t6} (nudge) = ${defaultTotal + t6} tokens (${((defaultTotal + t6) / 1000).toFixed(1)}K)`,
);
hr();

console.log("场景 D: 新会话 + secret + post-compaction");
console.log(
  `   ${withSecret} + ${t6} = ${withSecret + t6} tokens (${((withSecret + t6) / 1000).toFixed(1)}K)`,
);
hr();

console.log("========================================");
console.log("        与竞品默认上下文对比");
console.log("========================================");
hr();

const comparisons = [
  { name: "Codex / Claude Code", tokens: 20000 },
  { name: "Cline", tokens: 8000 },
  { name: "Aider", tokens: 5000 },
  { name: "Continue", tokens: 4000 },
  { name: "Huiyu Pi (默认)", tokens: defaultTotal },
];

for (const c of comparisons) {
  const bar = "█".repeat(Math.round(c.tokens / 500));
  console.log(`  ${c.name.padEnd(22)} ${String(c.tokens).padStart(5)} tokens  ${bar}`);
}
hr();

console.log(`Huiyu Pi vs Codex/Claude Code:`);
console.log(
  `  节省: ${((1 - defaultTotal / 20000) * 100).toFixed(1)}% (${20000 - defaultTotal} tokens)`,
);
console.log(`  = Codex/Claude code 是 Huiyu Pi 的 ${(20000 / defaultTotal).toFixed(1)}x`);
hr();
console.log(`Huiyu Pi vs Cline:`);
console.log(
  `  节省: ${((1 - defaultTotal / 8000) * 100).toFixed(1)}% (${8000 - defaultTotal} tokens)`,
);
console.log(`  = Cline 是 Huiyu Pi 的 ${(8000 / defaultTotal).toFixed(1)}x`);
