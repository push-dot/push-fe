import { useState, useEffect, useRef } from "react";
import {
  useEditor,
  EditorContent,
  Extension,
  type JSONContent,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  request,
  listAll,
  useResources,
  runOperation,
  type Resource,
  type AiOptions,
} from "@/shared/api";
import { Field, Form, Empty, Notice, Action, text } from "@/shared/ui";
import { useT, useLabel } from "@/shared/config";
import { useSession } from "@/shared/auth";
import { localRead, localWrite } from "@/shared/storage";
import { Approval } from "@/features/approval";
import { buildBlocks, type Block } from "../model/document-content";
import { reconcileDraft, makeDraft, type Draft } from "../model/draft";

import { isTauri, invoke } from "@tauri-apps/api/core";
const BlockIds = Extension.create({
  name: "blockIds",
  addGlobalAttributes: () => [
    {
      types: ["paragraph", "heading"],
      attributes: {
        blockId: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-block-id"),
          renderHTML: (attributes) => ({ "data-block-id": attributes.blockId }),
        },
      },
    },
  ],
});
export const DocumentsPage = () => {
  const t = useT();
  const label = useLabel();
  const docs = useResources("documents");
  const apps = useResources("applications");
  const evidence = useResources("career-evidence");
  const [selected, setSelected] = useState("");
  const document = docs.data.find((d) => d.id === selected);
  const [versions, setVersions] = useState<Resource[]>([]);
  const [version, setVersion] = useState<Resource | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const [proposal, setProposal] = useState<Resource | null>(null);
  const [ai, setAi] = useState<AiOptions>({
    provider: "OPENAI",
    model: "",
    credentialMode: "BYOK",
    effort: "MEDIUM",
  });
  const models = useResources("ai/models");
  const accountId = useSession((s) => s.accountId);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const evidenceRef = useRef(evidenceIds);
  evidenceRef.current = evidenceIds;
  const sourceRef = useRef(evidence.data);
  sourceRef.current = evidence.data;
  const docRef = useRef(document);
  docRef.current = document;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const editor = useEditor({
    extensions: [StarterKit, BlockIds],
    content: { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor }) => {
      const current = docRef.current;
      if (!current) return;
      const content = editor.getJSON();
      setStatus(t("수정 중", "Editing"));
      const payload = buildBlocks(
        editor.getJSON(),
        sourceRef.current
          .filter((e) => evidenceRef.current.includes(e.id))
          .map((e) => ({ id: e.id, sourceText: String(e.sourceText) })),
      );
      const local = makeDraft(
        draftRef.current,
        current,
        payload.content,
        payload.blocks,
        evidenceRef.current,
      );
      draftRef.current = local;
      setDraft(local);
      void localWrite(accountId, `draft:${current.id}`, local)
        .then(() => setStatus(t("기기에 저장됨", "Saved on device")))
        .catch((e) => setError(e.message));
    },
  });
  const load = async (id: string) => {
    const local = await localRead<Draft>(accountId, `draft:${id}`);
    if (local && selectedRef.current === id) {
      setDraft(local);
      editor?.commands.setContent(local.content as JSONContent, {
        emitUpdate: false,
      });
    }
    const rows = await listAll<Resource>(`documents/${id}/versions`).catch(
      async () =>
        (await localRead<Resource[]>(accountId, `versions:${id}`)) || [],
    );
    await localWrite(accountId, `versions:${id}`, rows);
    if (selectedRef.current !== id) return;
    setVersions(rows);
    const latest = rows[0] || null;
    setVersion(latest);
    if (selectedRef.current !== id) return;
    setDraft(local);
    editor?.commands.setContent(
      (local?.content ||
        latest?.content || {
          type: "doc",
          content: [{ type: "paragraph" }],
        }) as JSONContent,
      { emitUpdate: false },
    );
    setEvidenceIds(
      local?.evidenceIds ||
        (Array.from(
          new Set(
            (latest?.blocks || []).flatMap((b: Block) =>
              b.evidenceRefs.map((e) => e.evidenceId),
            ),
          ),
        ) as string[]),
    );
  };
  useEffect(() => {
    if (selected && editor)
      void load(selected).catch((e) => setError(e.message));
  }, [selected, editor]);
  const recovery = document
    ? reconcileDraft(draft, document)
    : { status: "clean" };
  const save = async () => {
    if (!document || !editor) return;
    const payload = buildBlocks(
      editor.getJSON(),
      evidence.data
        .filter((e) => evidenceIds.includes(e.id))
        .map((e) => ({ id: e.id, sourceText: String(e.sourceText) })),
    );
    let result: { document: Resource; version: Resource };
    try {
      result = await request<{ document: Resource; version: Resource }>(
        `documents/${document.id}/versions`,
        "POST",
        {
          expectedRevision: draft?.baseRevision ?? document.revision,
          ...payload,
          changeNote: "Manual edit",
        },
      );
    } catch (error) {
      if ((error as { status?: number }).status === 409) await docs.reload();
      throw error;
    }
    await localWrite(accountId, `draft:${document.id}`, null);
    setDraft(null);
    setVersion(result.version);
    await docs.reload();
    await load(document.id);
    setStatus(t("버전 저장됨", "Version saved"));
  };
  const syncDraft = async () => {
    if (!draft?.mutation || !document) return;
    const result = await request<{
      results: {
        status: string;
        resource: { revision: number } | null;
        error: { message: string } | null;
      }[];
    }>("sync/mutations", "POST", {
      clientId: isTauri() ? await invoke<string>("device_id") : accountId,
      mutations: [draft.mutation],
    });
    const outcome = result.results[0];
    if (outcome.status !== "APPLIED")
      throw new Error(outcome.error?.message || outcome.status);
    const synced = {
      ...draft,
      revision: outcome.resource?.revision,
      mutation: undefined,
    };
    setDraft(synced);
    await localWrite(accountId, `draft:${document.id}`, synced);
    setStatus(t("초안 동기화됨", "Draft synced"));
  };
  const exportFile = async (format: "PDF" | "DOCX") => {
    if (!document?.finalizedVersionId) return;
    const output = await request<Resource>(
      `documents/${document.id}/exports`,
      "POST",
      {
        versionId: document.finalizedVersionId,
        format,
        rendererVersion: "push-0.1.0",
      },
    );
    const { renderPdf, renderDocx, withLinks } =
      await import("../model/document-export");
    const renderBlocks = withLinks(output.content, output.blocks);
    let bytes: Uint8Array;
    let pageCount: number | undefined;
    let links = false;
    try {
      if (format === "PDF") {
        const font = new Uint8Array(
          await (await fetch("/fonts/nanum-gothic.ttf")).arrayBuffer(),
        );
        const result = await renderPdf(
          document.title,
          renderBlocks,
          output.template,
          font,
        );
        bytes = result.bytes;
        pageCount = result.pageCount;
        links = result.links;
      } else {
        bytes = await renderDocx(document.title, renderBlocks, output.template);
        links = output.blocks.some((b: Block) => /https?:\/\//.test(b.text));
      }
      const { validateExport } = await import("../model/export-validation");
      const validation = await validateExport(bytes, format, renderBlocks);
      if (!validation.atsText || !validation.koreanText || !validation.links)
        throw new Error(
          t(
            "출력 파일 텍스트·링크 검사에 실패했습니다.",
            "Export text or link validation failed.",
          ),
        );
      if (isTauri()) {
        const saved = await invoke<{
          path: string;
          sha256: string;
          byteLength: number;
        } | null>("save_export", {
          fileName: `${document.title}.${format.toLowerCase()}`,
          bytes: Array.from(bytes),
        });
        if (!saved) {
          setStatus(t("저장 취소됨", "Save cancelled"));
          return;
        }
      } else {
        const blob = new Blob([new Uint8Array(bytes).buffer], {
          type:
            format === "PDF"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const url = URL.createObjectURL(blob);
        const a = globalThis.document.createElement("a");
        a.href = url;
        a.download = `${document.title}.${format.toLowerCase()}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      }
      const sha256 = Array.from(
        new Uint8Array(
          await crypto.subtle.digest("SHA-256", new Uint8Array(bytes).buffer),
        ),
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      await request(
        `documents/${document.id}/exports/${output.id}/result`,
        "POST",
        {
          sha256,
          byteLength: bytes.length,
          ...(pageCount ? { pageCount } : {}),
          validation,
          status: "SUCCEEDED",
        },
      );
      setStatus(t("파일 생성 완료", "File created"));
    } catch (e) {
      setError((e as Error).message);
      throw e;
    }
  };
  return (
    <div className="page wide">
      <div className="page-heading">
        <div>
          <h1>{t("내 서류", "My documents")}</h1>
        </div>
      </div>
      <details className="panel" open={!docs.data.length}>
        <summary>{t("새 문서", "New document")}</summary>
        <Form
          onSubmit={async (f) => {
            const d = await request<Resource>("documents", "POST", {
              applicationId: text(f, "applicationId"),
              title: text(f, "title"),
              kind: text(f, "kind"),
              template: text(f, "template"),
            });
            await docs.reload();
            setSelected(d.id);
          }}
        >
          <div className="form-grid">
            <Field label={t("지원 대상", "Application")}>
              <select name="applicationId" required>
                <option value="">{t("선택", "Select")}</option>
                {apps.data.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.company} · {a.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("문서 제목", "Document title")}>
              <input name="title" required />
            </Field>
            <Field label={t("유형", "Type")}>
              <select name="kind">
                <option value="RESUME">{label("RESUME")}</option>
                <option value="PORTFOLIO">{label("PORTFOLIO")}</option>
                <option value="COVER_LETTER">{label("COVER_LETTER")}</option>
              </select>
            </Field>
            <Field label={t("템플릿", "Template")}>
              <select name="template">
                <option value="CLASSIC">{label("CLASSIC")}</option>
                <option value="MODERN">{label("MODERN")}</option>
                <option value="COMPACT">{label("COMPACT")}</option>
              </select>
            </Field>
          </div>
        </Form>
      </details>
      <div className="document-tabs">
        {docs.data.map((d) => (
          <button
            key={d.id}
            className={d.id === selected ? "selected" : ""}
            onClick={() => {
              setSelected(d.id);
              setProposal(null);
            }}
          >
            {d.title}
            <span className="badge">{label(d.status)}</span>
          </button>
        ))}
      </div>
      <Notice error={error || docs.error} />
      {!document ? (
        <Empty title={t("작성할 문서를 선택하세요", "Select a document")}>
          {t(
            "지원별로 문서와 버전이 분리됩니다.",
            "Each application keeps separate documents and versions.",
          )}
        </Empty>
      ) : (
        <>
          <div className="panel">
            <div className="row">
              <h2>{document.title}</h2>
              <span className="muted">{status}</span>
              <select
                aria-label={t("버전", "Version")}
                value={version?.id || ""}
                onChange={(e) => {
                  const v = versions.find((v) => v.id === e.target.value);
                  if (v) {
                    setVersion(v);
                    editor?.commands.setContent(v.content, {
                      emitUpdate: false,
                    });
                  }
                }}
              >
                <option value="">{t("버전 없음", "No versions")}</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    v{v.number} · {v.changeNote}
                  </option>
                ))}
              </select>
            </div>
            <div className="actions">
              {["CLASSIC", "MODERN", "COMPACT"].map((template) => (
                <Action
                  key={label(template)}
                  className={document.template === template ? "selected" : ""}
                  run={async () => {
                    await request(`documents/${document.id}`, "PATCH", {
                      expectedRevision: document.revision,
                      template,
                    });
                    await docs.reload();
                  }}
                >
                  {label(template)}
                </Action>
              ))}
            </div>
            {recovery.status === "conflict" && (
              <div className="notice">
                <p>
                  {t(
                    "서버와 로컬 초안이 충돌합니다. 두 내용을 비교한 뒤 병합하세요.",
                    "The server changed. Compare both versions before merging.",
                  )}
                </p>
                <details>
                  <summary>
                    {t("서버 버전 보기", "View server version")}
                  </summary>
                  <pre>
                    {versions[0]?.blocks?.map((b: Block) => b.text).join("\n")}
                  </pre>
                </details>
                <button
                  onClick={() => {
                    if (draft)
                      setDraft({ ...draft, baseRevision: document.revision });
                  }}
                >
                  {t(
                    "현재 편집 내용을 병합본으로 사용",
                    "Use current editor as merged draft",
                  )}
                </button>
              </div>
            )}
            <div className={`paper ${document.template.toLowerCase()}`}>
              <h1>{document.title}</h1>
              {editor && (
                <BubbleMenu editor={editor}>
                  <div className="bubble">
                    {[
                      ["REWRITE", "수정", "Rewrite"],
                      ["SHORTEN", "압축", "Shorten"],
                      ["EMPHASIZE_METRICS", "수치 강조", "Metrics"],
                      ["CHANGE_TONE", "톤 변경", "Tone"],
                      ["TAILOR_TO_JOB", "공고 맞춤", "Tailor"],
                    ].map(([action, ko, en]) => (
                      <Action
                        key={action}
                        disabled={!version || !ai.model}
                        run={async () => {
                          if (!version) return;
                          const { from, to } = editor.state.selection;
                          setProposal(
                            await runOperation<Resource>(
                              `documents/${document.id}/revisions`,
                              {
                                expectedRevision: document.revision,
                                versionId: version.id,
                                selection: {
                                  from,
                                  to,
                                  text: editor.state.doc.textBetween(from, to),
                                },
                                action,
                                ai,
                              },
                            ),
                          );
                        }}
                      >
                        {t(ko, en)}
                      </Action>
                    ))}
                  </div>
                </BubbleMenu>
              )}
              <EditorContent editor={editor} />
            </div>
            <div className="actions">
              <Action disabled={!draft?.mutation} run={syncDraft}>
                {t("초안 동기화", "Sync draft")}
              </Action>
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                {t("굵게", "Bold")}
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                {t("목록", "List")}
              </button>
              <Action
                className="primary"
                disabled={recovery.status === "conflict"}
                run={save}
              >
                {t("새 버전 저장", "Save new version")}
              </Action>
            </div>
          </div>
          <div className="panel">
            <h3>{t("문서의 원본 근거", "Document evidence")}</h3>
            {evidence.data.map((e) => (
              <div key={e.id}>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={evidenceIds.includes(e.id)}
                    onChange={(event) =>
                      setEvidenceIds(
                        event.target.checked
                          ? [...evidenceIds, e.id]
                          : evidenceIds.filter((id) => id !== e.id),
                      )
                    }
                  />
                  {e.title}
                </label>
                {evidenceIds.includes(e.id) && (
                  <Approval
                    kind="EVIDENCE_USE"
                    applicationId={document.applicationId}
                    targetId={e.id}
                    summary={`${t("근거 사용", "Evidence use")}: ${e.title}`}
                    reviewContent={
                      <p className="source-text">{e.sourceText}</p>
                    }
                  />
                )}
              </div>
            ))}
            <Action
              run={async () => {
                await runOperation(`documents/${document.id}/generate`, {
                  expectedRevision: document.revision,
                  evidenceIds,
                  ai: null,
                });
                await localWrite(accountId, `draft:${document.id}`, null);
                setDraft(null);
                await docs.reload();
                await load(document.id);
              }}
            >
              {t("원문 발췌로 작성", "Create from source excerpts")}
            </Action>
            <Field
              label={t(
                "문장 수정 AI (설정된 모델만)",
                "Revision AI (configured models only)",
              )}
            >
              <select
                value={ai.model}
                onChange={(e) => {
                  const m = models.data.find((m) => m.model === e.target.value);
                  setAi({
                    ...ai,
                    model: e.target.value,
                    provider: m?.provider || "OPENAI",
                  });
                }}
              >
                <option value="">{t("모델 선택", "Choose model")}</option>
                {models.data
                  .filter((m) => m.available)
                  .map((m) => (
                    <option key={m.model} value={m.model}>
                      {m.label}
                    </option>
                  ))}
              </select>
            </Field>
          </div>
          {proposal && (
            <div className="panel">
              <h3>{t("변경 제안", "Suggested revision")}</h3>
              <del>{proposal.selection.text}</del>
              <p>{proposal.replacement}</p>
              <span className="badge">{label(proposal.claimStatus)}</span>
              <Action
                run={async () => {
                  await request(
                    `documents/${document.id}/revisions/${proposal.id}/apply`,
                    "POST",
                    { expectedRevision: document.revision },
                  );
                  setProposal(null);
                  await docs.reload();
                  await load(document.id);
                }}
              >
                {t("적용", "Apply")}
              </Action>
              <button onClick={() => setProposal(null)}>
                {t("취소", "Cancel")}
              </button>
            </div>
          )}
          {version && (
            <div className="panel">
              <div className="quality">
                {Object.entries(version.quality || {})
                  .filter(([k]) =>
                    [
                      "jobFit",
                      "evidenceFidelity",
                      "readability",
                      "ats",
                    ].includes(k),
                  )
                  .map(([k, v]) => (
                    <div key={k}>
                      <small>{k}</small>
                      <strong>{v === null ? "—" : String(v)}</strong>
                    </div>
                  ))}
              </div>
              <Approval
                reviewContent={
                  <div>
                    {version.blocks?.map((block: Block) => (
                      <p key={block.id} className="source-text">
                        {block.text}
                      </p>
                    ))}
                  </div>
                }
                kind="DOCUMENT_FINALIZE"
                applicationId={document.applicationId}
                targetId={version.id}
                summary={t(
                  `버전 ${version.number} 확정 승인`,
                  `Approve version ${version.number}`,
                )}
                onApproved={async (approval) => {
                  await request(`documents/${document.id}/finalize`, "POST", {
                    expectedRevision: document.revision,
                    versionId: version.id,
                    approvalId: approval.id,
                  });
                  await docs.reload();
                }}
              />
              <div className="actions">
                <Action
                  disabled={!document.finalizedVersionId}
                  run={() => exportFile("PDF")}
                >
                  PDF ↓
                </Action>
                <Action
                  disabled={!document.finalizedVersionId}
                  run={() => exportFile("DOCX")}
                >
                  DOCX ↓
                </Action>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
