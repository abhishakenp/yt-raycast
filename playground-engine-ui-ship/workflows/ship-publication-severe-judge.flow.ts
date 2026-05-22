import {
  acp,
  compute,
  decision,
  decisionEdge,
  defineFlow,
  extractJsonObject,
  shell,
  action,
} from "acpx/flows";

const passChoices = ["pass", "fail"] as const;
const loopChoices = ["continue", "max_reached"] as const;

const REPO_ROOT = "/Users/livio/Documents/ship-fast";

export default defineFlow({
  name: "ship-publication-severe-judge",
  input: {
    brief: "string",
    slug: "string?",
    max_loops: "number?",
    run_id: "string?",
    fast: "boolean?",
  },
  startAt: "init",
  nodes: {
    init: compute({
      run: (input) => ({
        loop_count: 0,
        max_loops: input.max_loops ?? 3,
        run_id: input.run_id ?? String(Date.now()),
        brief:
          input.brief ??
          "A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.",
        slug: input.slug ?? "blog-dogs",
        fast: Boolean(input.fast),
        feedback: "",
        last_attempt: null as null | Record<string, unknown>,
        last_verdict: null as null | Record<string, unknown>,
      }),
    }),
    generate: shell({
      exec: ({ outputs }) => {
        const state = (outputs.store_retry ?? outputs.init) as {
          loop_count: number;
          max_loops: number;
          run_id: string;
          brief: string;
          slug: string;
          fast: boolean;
          feedback?: string;
        };
        const attempt = state.loop_count + 1;
        const args = [
          "playground-engine-ui-ship/scripts/ship-judge-run.mjs",
          `--run-id=${state.run_id}`,
          `--attempt=${attempt}`,
          `--brief=${state.brief}`,
          `--slug=${state.slug}`,
        ];
        if (state.feedback) args.push(`--feedback=${state.feedback}`);
        return {
          command: "bun",
          args,
          cwd: REPO_ROOT,
          env: {
            ...(state.fast ? { SHIP_FAST: "1" } : {}),
          },
        };
      },
      parse: (result) => {
        if (result.exitCode !== 0) {
          throw new Error(
            `generate failed (${result.exitCode}): ${result.stderr || result.stdout}`,
          );
        }
        return JSON.parse(result.stdout.trim());
      },
    }),
    severe_judge: shell({
      exec: ({ outputs }) => ({
        command: "bun",
        args: [
          "playground-engine-ui-ship/scripts/ship-severe-judge-kimi.mjs",
          outputs.generate.dir,
        ],
        cwd: REPO_ROOT,
      }),
      parse: (result) => {
        if (result.exitCode !== 0 && !result.stdout.trim()) {
          throw new Error(
            `severe judge failed (${result.exitCode}): ${result.stderr || result.stdout}`,
          );
        }
        try {
          return extractJsonObject(result.stdout);
        } catch {
          return JSON.parse(result.stdout.trim());
        }
      },
    }),
    merge: compute({
      run: ({ outputs }) => {
        const init = (outputs.store_retry ?? outputs.init) as {
          loop_count: number;
          max_loops: number;
          run_id: string;
          brief: string;
          slug: string;
          fast: boolean;
        };
        const attempt = outputs.generate;
        const verdict = outputs.severe_judge as {
          pass?: boolean;
          verdict?: string;
          score?: number;
          feedback?: string;
          critical_defects?: string[];
          issues?: string[];
        };
        const pass =
          Boolean(verdict.pass) ||
          (verdict.verdict === "pass" && (verdict.score ?? 0) >= 85);
        return {
          loop_count: init.loop_count,
          max_loops: init.max_loops,
          run_id: init.run_id,
          brief: init.brief,
          slug: init.slug,
          fast: init.fast,
          pass,
          attempt,
          verdict,
        };
      },
    }),
    check_pass: decision({
      choices: passChoices,
      question: ({ outputs }) => (outputs.merge.pass ? "pass" : "fail"),
    }),
    check_loop_limit: decision({
      choices: loopChoices,
      question: ({ outputs }) =>
        outputs.merge.loop_count + 1 >= outputs.merge.max_loops
          ? "max_reached"
          : "continue",
    }),
    increment_loop: compute({
      run: ({ outputs }) => {
        const m = outputs.merge;
        const v = m.verdict;
        const feedback = [
          v.feedback || "",
          ...(v.critical_defects || []).map((d) => `CRITICAL: ${d}`),
          ...(v.issues || []).slice(0, 5).map((d) => `ISSUE: ${d}`),
        ]
          .filter(Boolean)
          .join("\n");
        return {
          loop_count: m.loop_count + 1,
          max_loops: m.max_loops,
          run_id: m.run_id,
          brief: m.brief,
          slug: m.slug,
          fast: m.fast,
          feedback,
          last_attempt: m.attempt,
          last_verdict: m.verdict,
        };
      },
    }),
    replan: acp({
      agent: "cursor",
      model: "composer-2.5-fast",
      prompt: ({ outputs }) => {
        const il = outputs.increment_loop;
        const prev = il.last_verdict as { feedback?: string; issues?: string[] };
        return `You are a Ship-Fast engine tuning advisor (no code edits in this step).

Publication homepage generation failed severe Kimi K2.5 judge on attempt ${il.loop_count}/${il.max_loops}.

Brief: ${il.brief}

Judge feedback:
${prev?.feedback || il.feedback}

Issues:
${(prev?.issues || []).join("\n") || il.feedback}

Summarize the top 3 concrete engine/pipeline fixes (planner, hydration, postprocess) to pass the severe judge on retry. Keep under 120 words.`;
      },
    }),
    store_retry: compute({
      run: ({ outputs }) => {
        const il = outputs.increment_loop;
        const replan = String(outputs.replan || "");
        return {
          loop_count: il.loop_count,
          max_loops: il.max_loops,
          run_id: il.run_id,
          brief: il.brief,
          slug: il.slug,
          fast: il.fast,
          feedback: `${il.feedback}\n\nRetry plan:\n${replan}`.slice(0, 4000),
        };
      },
    }),
    success: action({
      run: ({ outputs }) => ({
        status: "PASS",
        run_id: outputs.merge.run_id,
        loops: outputs.merge.loop_count + 1,
        score: outputs.merge.verdict?.score,
        html: outputs.merge.attempt?.htmlPath,
        screenshot: outputs.merge.attempt?.pngPath,
        verdict: outputs.merge.verdict,
      }),
    }),
    max_loops_reached: action({
      run: ({ outputs }) => ({
        status: "MAX_LOOPS",
        run_id: outputs.merge.run_id,
        loops: outputs.merge.max_loops,
        last_score: outputs.merge.verdict?.score,
        html: outputs.merge.attempt?.htmlPath,
        screenshot: outputs.merge.attempt?.pngPath,
        verdict: outputs.merge.verdict,
      }),
    }),
  },
  edges: [
    { from: "init", to: "generate" },
    { from: "generate", to: "severe_judge" },
    { from: "severe_judge", to: "merge" },
    { from: "merge", to: "check_pass" },
    decisionEdge({
      from: "check_pass",
      choices: passChoices,
      cases: {
        pass: "success",
        fail: "check_loop_limit",
      },
    }),
    decisionEdge({
      from: "check_loop_limit",
      choices: loopChoices,
      cases: {
        continue: "increment_loop",
        max_reached: "max_loops_reached",
      },
    }),
    { from: "increment_loop", to: "replan" },
    { from: "replan", to: "store_retry" },
    { from: "store_retry", to: "generate" },
  ],
});
