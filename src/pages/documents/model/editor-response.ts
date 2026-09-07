import { makeDraft, type Draft } from "./draft";
export const createEditorGuard = () => {
  let context = "";
  let epoch = 0;
  return {
    select: (id: string) => {
      if (context !== id) {
        context = id;
        epoch++;
      }
    },
    edit: () => {
      epoch++;
    },
    ticket: () => `${context}:${epoch}`,
    matches: (ticket: string) => ticket === `${context}:${epoch}`,
  };
};
export const completeVersionSave = (
  draft: Draft | null,
  sent: string | undefined,
  revision: number,
): Draft | null => {
  if (!draft || draft.mutation?.mutationId === sent) return null;
  return makeDraft(
    { ...draft, baseRevision: revision },
    { id: draft.documentId, revision },
    draft.content || {},
    draft.blocks || [],
    draft.evidenceIds,
  );
};
