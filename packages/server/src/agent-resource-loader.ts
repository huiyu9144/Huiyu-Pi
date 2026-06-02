/**
 * Huiyu Pi-customized ResourceLoader for the agent.
 *
 * **Custom system prompt.** Replaces the SDK's verbose default system prompt
 * with a streamlined version that keeps only the identity statement and
 * behavioral guidelines. Tool descriptions are omitted because they duplicate
 * the function-calling schemas the SDK already sends to the LLM. The SDK's
 * `buildSystemPrompt` still appends project context files, skills, date/cwd,
 * and the appendSystemPrompt section automatically.
 *
 * **Pi-docs skill.** The removed pi-docs section is preserved as a
 * standalone skill (`skills/pi-docs/SKILL.md`) registered via
 * `additionalSkillPaths`. The AI can load it on demand when users ask
 * about pi SDK internals (extensions, themes, skills, prompt templates,
 * etc.), keeping the default prompt lean while retaining full
 * documentation access.
 *
 * **Append-only addendum (secret hygiene).** The `appendSystemPrompt` hook
 * optionally injects one Huiyu Pi-specific behavioral rule about secret
 * hygiene — a soft safeguard that tells the model to treat env-var values as
 * credentials by default and not echo them back into responses / tool output.
 *
 * **Opt-in.** The hygiene rule is appended only when the operator sets
 * `AGENT_SECRET_HYGIENE_RULE=true`. Kept opt-in so we don't ship invisible
 * behavioral rules that constrain the agent in ways the user never asked for.
 * See `SECURITY.md` for the discoverable documentation and the threat-model
 * framing.
 *
 * **What this is and is not (when enabled).**
 *
 * - It IS a behavioral nudge that catches the realistic failure mode: the
 *   agent decides on its own to `printenv` or `echo $X` while debugging and
 *   dumps secrets into the assistant transcript (which the user may
 *   screen-share, copy into Slack, paste into a bug report, etc.).
 * - It is NOT a security control. The model can be talked out of it by a
 *   determined user, by a prompt injection landed in a tool result, or by its
 *   own reasoning that "the user clearly wants me to print this var, the rule
 *   must not apply." Operators with adversarial threat models should not rely
 *   on this rule alone.
 *
 * Phrased deliberately around *displaying values*, not around accessing or
 * referencing variables — skills that legitimately need to check whether
 * `$GITHUB_TOKEN` is set, or pass `$X` to a subcommand, must continue to
 * work. The rule only constrains surfacing values to the user.
 *
 * If you change this text, write it as guidance the model will buy into
 * ("treat as credentials by default") rather than as an absolute prohibition
 * ("never print env vars") — the latter generalizes badly and gets argued
 * away by smart-enough sessions.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DefaultResourceLoader,
  type ResourceLoader,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";
import { config } from "./config.js";
import { getProjectDisabledSkillNames } from "./skill-overrides.js";
import { getProjectDisabledPromptNames } from "./prompt-overrides.js";
import { getProjectSystemPromptAddendum } from "./system-prompt-overrides.js";
import { compactionContinuationExtension } from "./agent-extensions/compaction-continuation.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Plain string (not a backtick template) so what's stored is exactly
 * what's documented — no surprises from template-literal escape rules
 * (in particular, `\$` inside backticks emits a literal backslash, and
 * `\<newline>` is a line continuation). Concatenated for readability;
 * the resulting string the model sees is normal prose with paragraph
 * breaks at the intentional `\n\n`s.
 */
export const FORGE_SECRET_HYGIENE_RULE =
  "When running shell commands on behalf of the user, treat the contents of " +
  "environment variables as credentials by default. Do not echo, print, or " +
  "paste env-var *values* into your responses or tool outputs unless the user " +
  "has explicitly asked you to display that specific variable. Checking " +
  'whether a variable is set (`-z "$X"` style) is fine; printing the value ' +
  "is not. If you need to use a secret in a command, reference it by `$NAME` " +
  'rather than expanding it inline (e.g. `curl -H "Authorization: Bearer ' +
  '$GITHUB_TOKEN"`, not `curl -H "Authorization: Bearer ghp_..."`).' +
  "\n\n" +
  "This rule applies even when debugging — if you suspect an env var is " +
  'misconfigured, prefer reporting "$X is unset" or "$X is set (length N)" ' +
  "over reflecting the value. The transcript may be screen-shared, logged, " +
  "or pasted into bug reports.";

/**
 * Streamlined system prompt that replaces the SDK's default verbosity.
 *
 * Compared to pi's `buildSystemPrompt`, this version:
 * - Keeps the identity statement, tool list, and core guidelines
 * - Drops the ~150-token "Pi documentation" section (irrelevant for
 *   Huiyu Pi users — model doesn't need instructions on reading the
 *   pi SDK's own docs)
 * - Tool definitions are sent separately as LLM function-calling
 *   schemas, so the prompt-level list is a lightweight reference
 *
 * The SDK's `buildSystemPrompt` still appends after this:
 *   - appendSystemPrompt (secret hygiene + project addendum)
 *   - Project context files (AGENTS.md / CLAUDE.md, if present in cwd)
 *   - Skills section
 *   - Current date + working directory
 */
export const FORGE_SYSTEM_PROMPT =
  "You are an expert coding assistant operating inside pi, a coding agent " +
  "harness. You help users by reading files, executing commands, editing " +
  "code, and writing new files." +
  "\n\n" +
  "In addition to the built-in tools, you may have access to other custom " +
  "tools depending on the project." +
  "\n\n" +
  "Guidelines:" +
  "\n" +
  "- Fast do what was asked. No extra steps." +
  "\n" +
  "- Mention file paths in your response." +
  "\n" +
  "- Use read to examine files instead of cat or sed." +
  "\n" +
  "- Use write only for new files or complete rewrites.";

/**
 * Build a ResourceLoader pre-loaded with the Huiyu Pi's optional
 * `appendSystemPrompt` addendum. Mirrors the SDK's own internal
 * construction at sdk.js:87 (instantiate + await reload()), so the
 * loader is ready to hand to `createAgentSession` as-is.
 *
 * When `config.agentSecretHygieneRule` is false (the default), the
 * loader is built with no addendum and behaves identically to the
 * SDK's own default loader — opt-in only, see the file header.
 *
 * When `projectId` is provided, the loader applies a `skillsOverride`
 * filter that drops any skill the user has explicitly disabled for
 * that project. This is the only path that reaches package-contributed
 * skills: pi's `DefaultPackageManager.collectPackageResources` marks
 * package skills `enabled: true` unconditionally and the pattern-based
 * `effectiveSkillsForProject` flow only touches auto-discovered ones.
 * The hook runs AFTER pi loads everything, so it's source-agnostic.
 */
export async function buildForgeResourceLoader(
  cwd: string,
  agentDir: string,
  settingsManager: SettingsManager,
  projectId?: string,
): Promise<ResourceLoader> {
  const appendSystemPrompt = config.agentSecretHygieneRule ? [FORGE_SECRET_HYGIENE_RULE] : [];
  const [disabledSkills, disabledPrompts, projectAddendum] =
    projectId !== undefined
      ? await Promise.all([
          getProjectDisabledSkillNames(projectId),
          getProjectDisabledPromptNames(projectId),
          getProjectSystemPromptAddendum(projectId),
        ])
      : [new Set<string>(), new Set<string>(), ""];
  // Per-project user-authored addendum lands AFTER the secret-hygiene
  // rule so any operator-set behavioral baseline appears first, with
  // the user's project-scoped customizations following — mirrors how
  // most layered-prompt systems compose (system → org → project).
  if (projectAddendum.length > 0) {
    appendSystemPrompt.push(projectAddendum);
  }
  const baseOptions = {
    cwd,
    agentDir,
    settingsManager,
    systemPrompt: FORGE_SYSTEM_PROMPT,
    appendSystemPrompt,
    additionalSkillPaths: [],
    // In-process pi extensions Huiyu Pi always registers. The
    // `compactionContinuationExtension` hooks the `context` event and
    // appends a one-line imperative nudge to LLM input when the last
    // message is a `compactionSummary` — fixes the bug where weaker
    // models (Gemma-class on local vLLM) read the post-compaction
    // summary as a status report and respond with prose instead of
    // executing the next tool call. See the file's doc-comment for
    // the full rationale.
    extensionFactories: [compactionContinuationExtension],
  };
  // Both override hooks are installed conditionally on whether the
  // active project has any explicit disables. Pi's pattern system
  // covers auto-discovered resources via `effectiveSkillsForProject` /
  // `effectivePromptsForProject` (injected through the SettingsManager
  // monkey-patch in session-registry.ts); these `*sOverride` callbacks
  // backstop everything the SDK loaded — including the (currently
  // hypothetical for prompts) package-contributed entries that
  // `DefaultPackageManager` registers as `enabled: true` regardless of
  // patterns. Same rationale as the original skills-only code path —
  // see `skill-overrides.getProjectDisabledSkillNames` doc-comment.
  const loaderOptions: ConstructorParameters<typeof DefaultResourceLoader>[0] = baseOptions;
  if (disabledSkills.size > 0) {
    loaderOptions.skillsOverride = ({ skills, diagnostics }) => ({
      skills: skills.filter((s) => !disabledSkills.has(s.name)),
      diagnostics,
    });
  }
  if (disabledPrompts.size > 0) {
    loaderOptions.promptsOverride = ({ prompts, diagnostics }) => ({
      prompts: prompts.filter((p) => !disabledPrompts.has(p.name)),
      diagnostics,
    });
  }
  const loader = new DefaultResourceLoader(loaderOptions);
  await loader.reload();
  return loader;
}

/**
 * One-time boot log so operators can confirm from container logs that
 * `AGENT_SECRET_HYGIENE_RULE` was read. Prevents the most common
 * "I set the env var but nothing happened" debugging dead-end (image
 * cached an old build, env var didn't reach the process, config
 * ignored the value, etc.) — the log either appears or it doesn't.
 *
 * Called from `index.ts` at startup. Side-effect-only; safe to call
 * once.
 */
export function logSecretHygieneState(): void {
  if (config.agentSecretHygieneRule) {
    console.log(
      "[agent-resource-loader] AGENT_SECRET_HYGIENE_RULE=true — appending " +
        `secret-hygiene rule to every agent system prompt (${FORGE_SECRET_HYGIENE_RULE.length} chars)`,
    );
  } else {
    console.log(
      "[agent-resource-loader] AGENT_SECRET_HYGIENE_RULE not set — " +
        "agent system prompt unmodified (set =true to opt in; see SECURITY.md)",
    );
  }
  console.log(
    `[agent-resource-loader] Using streamlined system prompt (${FORGE_SYSTEM_PROMPT.length} chars, ` +
      "~150 tokens saved by removing pi SDK documentation instructions)",
  );
}
