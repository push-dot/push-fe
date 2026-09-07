export type Draft = {
  documentId: string;
  baseRevision: number;
  text: string;
  evidenceIds: string[];
  updatedAt: string;
  content?: object;
  blocks?: object[];
  id?: string;
  revision?: number;
  mutation?: {
    mutationId: string;
    resourceType: "DOCUMENT_DRAFT";
    resourceId: string;
    expectedRevision: number;
    action: "CREATE" | "UPDATE";
    payload: {
      documentId?: string;
      baseDocumentRevision: number;
      content: object;
      blocks: object[];
    };
  };
};
export const reconcileDraft = (
  draft: Draft | null,
  document: { id: string; revision: number },
): { status: "clean" | "pending" | "conflict"; draft?: Draft } =>
  !draft || draft.documentId !== document.id
    ? { status: "clean" }
    : {
        status:
          draft.baseRevision === document.revision ? "pending" : "conflict",
        draft,
      };
export const makeDraft = (
  existing: Draft | null,
  document: { id: string; revision: number },
  content: object,
  blocks: object[],
  evidenceIds: string[],
): Draft => {
  const prior = existing?.documentId === document.id ? existing : null;
  const id = prior?.id || crypto.randomUUID();
  const baseRevision = prior?.baseRevision ?? document.revision;
  const payload = { baseDocumentRevision: baseRevision, content, blocks };
  return {
    documentId: document.id,
    id,
    revision: prior?.revision,
    baseRevision,
    content,
    blocks,
    evidenceIds,
    text: "",
    updatedAt: new Date().toISOString(),
    mutation: {
      mutationId: crypto.randomUUID(),
      resourceType: "DOCUMENT_DRAFT",
      resourceId: id,
      expectedRevision: prior?.revision || 0,
      action: prior?.revision ? "UPDATE" : "CREATE",
      payload: prior?.revision
        ? payload
        : { ...payload, documentId: document.id },
    },
  };
};
export const applyDraftSync = (
  draft: Draft,
  mutationId: string,
  revision: number,
): Draft => {
  if (draft.mutation?.mutationId === mutationId)
    return { ...draft, revision, mutation: undefined };
  const rebased = makeDraft(
    { ...draft, revision },
    { id: draft.documentId, revision: draft.baseRevision },
    draft.content || {},
    draft.blocks || [],
    draft.evidenceIds,
  );
  if (draft.mutation && rebased.mutation)
    rebased.mutation.mutationId = draft.mutation.mutationId;
  return rebased;
};

export const mergeDraftEdit = (stored: Draft | null, edit: Draft): Draft => {
  if (!stored || stored.documentId !== edit.documentId) return edit;
  const merged = makeDraft(
    {
      ...edit,
      id: stored.id || edit.id,
      revision: Math.max(stored.revision || 0, edit.revision || 0) || undefined,
      baseRevision: Math.max(stored.baseRevision, edit.baseRevision),
    },
    { id: edit.documentId, revision: edit.baseRevision },
    edit.content || {},
    edit.blocks || [],
    edit.evidenceIds,
  );
  if (edit.mutation && merged.mutation)
    merged.mutation.mutationId = edit.mutation.mutationId;
  return merged;
};
