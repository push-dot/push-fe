import { useState } from "react";
import {
  request,
  listAll,
  useResources,
  runOperation,
  type Resource,
} from "@/shared/api";
import { Field, Form, Empty, Notice, Action, text } from "@/shared/ui";
import { Approval } from "@/features/approval";
import { useSession } from "@/shared/auth";
import { useT, useLabel } from "@/shared/config";
import { invoke, isTauri } from "@tauri-apps/api/core";
export const ProjectsPage = () => {
  const t = useT();
  const label = useLabel();
  const projects = useResources("projects");
  const apps = useResources("applications");
  const [history, setHistory] = useState<Resource[]>([]);
  const [verification, setVerification] = useState<Resource | null>(null);
  const [run, setRun] = useState<Resource | null>(null);
  const [detected, setDetected] = useState<Resource[]>([]);
  const [selected, setSelected] = useState("");
  const [directory, setDirectory] = useState("");
  const [application, setApplication] = useState("");
  const jobId = apps.data.find((a) => a.id === application)?.jobId;
  const analyses = useResources(jobId ? `jobs/${jobId}/analyses` : "jobs");
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t("역량 보완 프로젝트", "Skill-building projects")}</h1>
        </div>
      </div>
      <div className="panel">
        <Form
          submitLabel={t("블루프린트 4개 만들기", "Create four blueprints")}
          onSubmit={async (f) => {
            await runOperation("projects/blueprints", {
              applicationId: text(f, "applicationId"),
              gapAnalysisId: text(f, "gapAnalysisId"),
              ai: null,
            });
            await projects.reload();
          }}
        >
          <Field label={t("지원 대상", "Application")}>
            <select
              name="applicationId"
              required
              value={application}
              onChange={(e) => setApplication(e.target.value)}
            >
              <option value="">{t("선택", "Select")}</option>
              {apps.data.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.company} · {a.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("공고 분석", "Job analysis")}>
            <select name="gapAnalysisId" required>
              <option value="">
                {t("분석을 선택하세요", "Choose an analysis")}
              </option>
              {jobId &&
                analyses.data.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.method} · {a.createdAt}
                  </option>
                ))}
            </select>
          </Field>
        </Form>
      </div>
      <Notice error={projects.error} />
      {projects.data.map((p) => (
        <div className="panel" key={p.id}>
          <h2>{p.title}</h2>
          <p>{p.problem}</p>
          <p>{p.solution}</p>
          <ul>
            {p.tasks?.map((task: { id: string; title: string }) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
          <Action
            run={async () => {
              if (!isTauri())
                throw new Error(
                  t(
                    "폴더 선택과 CLI 실행은 데스크톱 앱에서 가능합니다.",
                    "Folder selection and CLI execution require the desktop app.",
                  ),
                );
              const selection = await request<Resource>(
                `projects/${p.id}/select`,
                "POST",
                { expectedRevision: p.revision },
              );
              const result = await invoke<{ workingDirectory: string } | null>(
                "copy_project",
                { manifest: selection.manifest },
              );
              if (!result) return;
              setSelected(p.id);
              setDirectory(result.workingDirectory);
              setDetected(await invoke<Resource[]>("detect_clis"));
              await projects.reload();
            }}
          >
            {t("프로젝트 폴더 만들기", "Create project folder")}
          </Action>
          <Action
            run={async () => {
              setHistory(await listAll<Resource>(`projects/${p.id}/runs`));
              setSelected(p.id);
            }}
          >
            {t("실행 이력", "Run history")}
          </Action>
          {selected === p.id &&
            history.map((item) => (
              <button key={item.id} onClick={() => setRun(item)}>
                {item.provider} · {label(item.state)} ·{" "}
                {new Date(item.createdAt).toLocaleDateString()}
              </button>
            ))}
          {selected === p.id && directory && (
            <Form
              submitLabel={t("명령 미리보기", "Preview command")}
              onSubmit={async (f) =>
                setRun(
                  await request<Resource>(`projects/${p.id}/runs`, "POST", {
                    provider: text(f, "provider"),
                    workingDirectory: directory,
                    prompt: text(f, "prompt"),
                  }),
                )
              }
            >
              <p className="muted">{directory}</p>
              <Field label="CLI">
                <select name="provider">
                  {["CODEX", "CLAUDE_CODE", "GROK_BUILD"].map((provider) => (
                    <option
                      key={provider}
                      disabled={
                        !detected.find((d) => d.provider === provider)
                          ?.installed
                      }
                    >
                      {provider} ·{" "}
                      {detected.find((d) => d.provider === provider)?.version ||
                        t("미설치", "Not installed")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("전달할 프롬프트", "Prompt")}>
                <textarea name="prompt" defaultValue={p.solution} required />
              </Field>
            </Form>
          )}
        </div>
      ))}
      {!projects.data.length && (
        <Empty
          title={t(
            "부족한 기술을 실제 경험으로",
            "Turn skill gaps into real experience",
          )}
        >
          {t(
            "지원 공고에서 프로젝트를 제안합니다. 실행과 검증은 별도로 승인합니다.",
            "Create projects from job requirements. Execution and evidence verification are separate.",
          )}
        </Empty>
      )}
      {run && (
        <div className="panel">
          <h3>{t("실행 전 검토", "Review before execution")}</h3>
          <pre>
            {JSON.stringify(
              {
                provider: run.provider,
                workingDirectory: run.workingDirectory,
                executable: run.executable,
                arguments: run.arguments,
                prompt: run.prompt,
              },
              null,
              2,
            )}
          </pre>
          {run.state === "APPROVAL_REQUIRED" && (
            <Approval
              reviewContent={
                <>
                  <p>{run.workingDirectory}</p>
                  <pre>
                    {run.executable} {JSON.stringify(run.arguments)}
                  </pre>
                  <p className="source-text">{run.prompt}</p>
                </>
              }
              kind="CLI_EXECUTE"
              applicationId={run.applicationId}
              targetId={run.id}
              summary={t(
                "외부 Terminal 실행 승인",
                "Approve external Terminal execution",
              )}
              onApproved={async (approval) => {
                const session = useSession.getState();
                const started = await invoke<Resource>("launch_cli", {
                  apiBase: session.apiUrl,
                  accessToken: session.accessToken,
                  projectId: run.projectId,
                  runId: run.id,
                  expectedRevision: run.revision,
                  approvalId: approval.id,
                });
                setRun(started);
              }}
            />
          )}
          <div className="actions">
            <span className="badge">
              {label(run.state)} · {label(run.launchStatus || "")}
            </span>
            <Action
              run={async () => {
                const session = useSession.getState();
                setRun(
                  await invoke<Resource>("poll_cli", {
                    apiBase: session.apiUrl,
                    accessToken: session.accessToken,
                    projectId: run.projectId,
                    runId: run.id,
                  }),
                );
              }}
            >
              {t("실행 상태 확인", "Check run status")}
            </Action>
          </div>
          {run.native?.state === "FINISHED" && (
            <Action
              run={async () => {
                const session = useSession.getState();
                const completed = await invoke<Resource | null>(
                  "complete_cli",
                  {
                    apiBase: session.apiUrl,
                    accessToken: session.accessToken,
                    projectId: run.projectId,
                    runId: run.id,
                  },
                );
                if (completed) setRun(completed);
              }}
            >
              {t(
                "실행 로그 첨부 후 결과 기록",
                "Attach run logs and record result",
              )}
            </Action>
          )}
          {run.launchStatus === "UNKNOWN" && (
            <Action
              run={async () => {
                const session = useSession.getState();
                setRun(
                  await invoke<Resource>("recover_cli", {
                    apiBase: session.apiUrl,
                    accessToken: session.accessToken,
                    projectId: run.projectId,
                    runId: run.id,
                    decision: "MARK_FAILED",
                    failureReason:
                      "User confirmed external execution cannot be resumed",
                  }),
                );
              }}
            >
              {t(
                "실행 중단 확인 후 실패로 닫기",
                "Confirm stopped and close as failed",
              )}
            </Action>
          )}
          <Form
            submitLabel={t("실행 증빙 등록", "Submit run evidence")}
            onSubmit={async (f) => {
              setVerification(
                await request<Resource>(
                  `projects/${run.projectId}/evidence`,
                  "POST",
                  {
                    runId: run.id,
                    commitUrl: text(f, "commitUrl"),
                    testCommand: text(f, "testCommand"),
                    testOutput: text(f, "testOutput"),
                    exitCode: Number(text(f, "exitCode")),
                    metrics: [
                      {
                        name: text(f, "metricName"),
                        value: Number(text(f, "metricValue")),
                        unit: text(f, "metricUnit"),
                      },
                    ],
                    summary: text(f, "summary"),
                  },
                ),
              );
            }}
          >
            <Field label="GitHub commit URL">
              <input type="url" name="commitUrl" required />
            </Field>
            <Field label={t("테스트 명령", "Test command")}>
              <input name="testCommand" required />
            </Field>
            <Field label={t("실제 테스트 출력", "Actual test output")}>
              <textarea name="testOutput" required />
            </Field>
            <div className="form-grid">
              <Field label="Exit code">
                <input type="number" name="exitCode" required />
              </Field>
              <Field label={t("측정 이름", "Metric name")}>
                <input name="metricName" required />
              </Field>
              <Field label={t("측정값", "Value")}>
                <input type="number" name="metricValue" required />
              </Field>
              <Field label={t("단위", "Unit")}>
                <input name="metricUnit" required />
              </Field>
            </div>
            <Field label={t("결과 요약", "Summary")}>
              <textarea name="summary" required />
            </Field>
          </Form>
          {verification && (
            <div className="panel">
              <p>{label(verification.status)}</p>
              <Action
                run={async () =>
                  setVerification(
                    await runOperation<Resource>(
                      `projects/${run.projectId}/evidence/${verification.id}/verify`,
                      { expectedRevision: verification.revision },
                    ),
                  )
                }
              >
                {t("독립 검증 요청", "Request independent verification")}
              </Action>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
