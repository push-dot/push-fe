// Bot cards in chat as A2UI surfaces of the Push catalog, in v0.9.1 (Android) or 1.0 (iOS, web).
// Source of truth: push-be packages/contracts/a2ui (README.md, push-catalog*.json, fixtures/).
// Copies of the fixtures: ./a2ui-fixtures (v0.9.1) and ./a2ui-fixtures/v1.0.

/** The A2UI version a client draws, sent as the `A2UI-Version` header and echoed in every message's `version`. The server reads a missing header as v0.9.1. */
export type A2uiVersion = '1.0' | 'v0.9.1'

/** The card a surface draws. Only approval and choice take an answer. */
export type A2uiKind = 'approval' | 'choice' | 'plan' | 'paper' | 'todo' | 'diff' | 'fit' | 'result'

/** One component of a surface: `component` names the catalog type, the other keys are its props. A data-bound prop is `{ path }` in v0.9.1 and `{ '@path' }` in 1.0. */
export type A2uiComponent = { id: string; component: string; [prop: string]: unknown }

export type A2uiCreateSurface = { version: A2uiVersion; createSurface: { surfaceId: string; catalogId: string } }
export type A2uiUpdateComponents = { version: A2uiVersion; updateComponents: { surfaceId: string; components: A2uiComponent[] } }
/** The server always sends `path` "/" with the whole data model as `value`. */
export type A2uiUpdateDataModel = { version: A2uiVersion; updateDataModel: { surfaceId: string; path?: string; value?: unknown } }
export type A2uiMessage = A2uiCreateSurface | A2uiUpdateComponents | A2uiUpdateDataModel

/**
 * A Bot card frame, the same in both versions except inside `messages`. `messages` is a full snapshot: createSurface, updateComponents, updateDataModel.
 * Upsert by `surfaceId`: when the surface exists, drop createSurface and apply the other two.
 * approval and choice: `surfaceId` is the approval id of the answer route.
 */
export type A2uiFrame = { type: 'a2ui'; kind: A2uiKind; surfaceId: string; messages: A2uiMessage[] }

/** Actions the app handles itself. They never reach the server. */
export type A2uiLocalActionName = 'open_review' | 'share' | 'result_action' | 'open_plan' | 'change' | 'open_posting'
/** The only ids a `result_action` may run. */
export type A2uiResultActionId = 'apply' | 'convert' | 'view' | 'retry_save'

/** The context of `answer`: the body of POST .../approvals/{surfaceId}. */
export type A2uiAnswerContext = { optionId: string; optionIds?: string[] }

/** What a renderer dispatches. `answer` goes to the approvals route; every other name is local. */
export type A2uiAction = { surfaceId: string; sourceComponentId: string; timestamp: string } & (
  | { name: 'answer'; context: A2uiAnswerContext }
  | { name: 'open_review' | 'share'; context: { documentId: string } }
  | { name: 'result_action'; context: { id: string; method?: string; path?: string } }
  | { name: 'open_plan'; context: Record<string, never> }
  | { name: 'change'; context: { optionId: string } }
  | { name: 'open_posting'; context: { postingId: string } }
)

/**
 * The approvals body for a PushChoice answer, built the way its `answer` prop says.
 * pick: the first id, plus every id when more than one. submit: "submit", then the picks of every answerable question in question order.
 * A secondary button answers as a pick of its own id.
 */
export const answerBody = (answer: 'pick' | 'submit', picked: string[]): A2uiAnswerContext => {
  if (answer === 'submit') return { optionId: 'submit', optionIds: ['submit', ...picked] }
  const [first] = picked
  if (first === undefined) throw new Error('answerBody: a pick needs at least one id')
  return picked.length > 1 ? { optionId: first, optionIds: picked } : { optionId: first }
}
