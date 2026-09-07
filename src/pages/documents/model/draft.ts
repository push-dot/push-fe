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
