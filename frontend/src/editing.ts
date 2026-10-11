import type { operations } from "../../sdk/generated.js";

export type UpdateMomentBody = operations["updateMoment"]["requestBody"]["content"]["application/json"];
export type MomentSnapshot = operations["listMomentRevisions"]["responses"][200]["content"]["application/json"]["items"][number]["snapshot"];
export type SnapshotField = Extract<keyof MomentSnapshot, string>;

export type EmotionDraft = { key: string; intensity: string };
export type EditDraft = {
  title: string;
  narrative: string;
  agentSummary: string;
  precision: NonNullable<UpdateMomentBody["happenedAtPrecision"]>;
  happenedOn: string;
  happenedLocal: string;
  scene: string;
  emotions: EmotionDraft[];
  intensity: string;
  severity: string;
  fearedOutcome: string;
  outcomeKnownBy: string;
  thoughts: string;
  bodySignals: string;
  immediateResponse: string;
  people: string[];
  reason: string;
};

export type EditMergeGroup = Exclude<
  keyof EditDraft,
  "reason" | "precision" | "happenedOn" | "happenedLocal"
> | "time";

const nullableText = (value: string) => value.trim() || null;
const nullableNumber = (value: string) =>
  value.trim() ? Number(value) : null;
const normalizedPeople = (values: string[]) =>
  values.map((value) => value.trim()).filter(Boolean);
const normalizedEmotions = (values: EmotionDraft[]) =>
  values.map((item) => ({
    key: item.key,
    intensity: nullableNumber(item.intensity),
  }));
const same = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

function timeChanged(base: EditDraft, draft: EditDraft) {
  return (
    base.precision !== draft.precision ||
    (draft.precision === "exact"
      ? base.happenedLocal !== draft.happenedLocal
      : base.happenedOn !== draft.happenedOn)
  );
}

export function buildPatch(
  base: EditDraft,
  draft: EditDraft,
  expectedRevision: number,
  formatHappenedAt: (draft: EditDraft) => string,
): UpdateMomentBody | null {
  const patch: Partial<UpdateMomentBody> = { expectedRevision };
  let changed = 0;
  const add = <K extends keyof UpdateMomentBody>(key: K, value: UpdateMomentBody[K]) => {
    patch[key] = value;
    changed += 1;
  };

  if (base.title.trim() !== draft.title.trim()) add("title", draft.title.trim());
  if (base.narrative !== draft.narrative) add("narrative", draft.narrative);
  if (nullableText(base.agentSummary) !== nullableText(draft.agentSummary))
    add("agentSummary", nullableText(draft.agentSummary));
  if (timeChanged(base, draft)) {
    add("happenedAt", formatHappenedAt(draft));
    add("happenedAtPrecision", draft.precision);
  }
  if (base.scene !== draft.scene)
    add("scene", draft.scene as UpdateMomentBody["scene"]);
  const baseEmotions = normalizedEmotions(base.emotions);
  const nextEmotions = normalizedEmotions(draft.emotions);
  if (!same(baseEmotions, nextEmotions))
    add(
      "emotions",
      nextEmotions.map(({ key, intensity }) => ({
        key: key as NonNullable<UpdateMomentBody["emotions"]>[number]["key"],
        ...(intensity == null ? {} : { intensity }),
      })),
    );
  if (Number(base.intensity) !== Number(draft.intensity))
    add("intensity", Number(draft.intensity));
  if (nullableNumber(base.severity) !== nullableNumber(draft.severity))
    add("severity", nullableNumber(draft.severity));
  if (nullableText(base.fearedOutcome) !== nullableText(draft.fearedOutcome))
    add("fearedOutcome", nullableText(draft.fearedOutcome));
  if (nullableText(base.outcomeKnownBy) !== nullableText(draft.outcomeKnownBy))
    add("outcomeKnownBy", nullableText(draft.outcomeKnownBy));
  if (nullableText(base.thoughts) !== nullableText(draft.thoughts))
    add("thoughts", nullableText(draft.thoughts));
  if (nullableText(base.bodySignals) !== nullableText(draft.bodySignals))
    add("bodySignals", nullableText(draft.bodySignals));
  if (
    nullableText(base.immediateResponse) !==
    nullableText(draft.immediateResponse)
  )
    add("immediateResponse", nullableText(draft.immediateResponse));
  const basePeople = normalizedPeople(base.people);
  const nextPeople = normalizedPeople(draft.people);
  if (!same(basePeople, nextPeople)) add("people", nextPeople);

  if (!changed) return null;
  if (draft.reason.trim()) patch.reason = draft.reason.trim();
  return patch as UpdateMomentBody;
}

function changedGroups(base: EditDraft, draft: EditDraft) {
  const changed = new Set<EditMergeGroup>();
  if (timeChanged(base, draft)) changed.add("time");
  const fields: [EditMergeGroup, unknown, unknown][] = [
    ["title", base.title.trim(), draft.title.trim()],
    ["narrative", base.narrative, draft.narrative],
    ["agentSummary", nullableText(base.agentSummary), nullableText(draft.agentSummary)],
    ["scene", base.scene, draft.scene],
    ["emotions", normalizedEmotions(base.emotions), normalizedEmotions(draft.emotions)],
    ["intensity", Number(base.intensity), Number(draft.intensity)],
    ["severity", nullableNumber(base.severity), nullableNumber(draft.severity)],
    ["fearedOutcome", nullableText(base.fearedOutcome), nullableText(draft.fearedOutcome)],
    ["outcomeKnownBy", nullableText(base.outcomeKnownBy), nullableText(draft.outcomeKnownBy)],
    ["thoughts", nullableText(base.thoughts), nullableText(draft.thoughts)],
    ["bodySignals", nullableText(base.bodySignals), nullableText(draft.bodySignals)],
    ["immediateResponse", nullableText(base.immediateResponse), nullableText(draft.immediateResponse)],
    ["people", normalizedPeople(base.people), normalizedPeople(draft.people)],
  ];
  for (const [field, before, after] of fields)
    if (!same(before, after)) changed.add(field);
  return changed;
}

const timeSnapshotFields = new Set<SnapshotField>([
  "happenedAt",
  "happenedOn",
  "happenedAtPrecision",
]);

function remoteGroups(fields: Iterable<string>) {
  const groups = new Set<EditMergeGroup>();
  for (const field of fields) {
    if (timeSnapshotFields.has(field as SnapshotField)) groups.add("time");
    else groups.add(field as EditMergeGroup);
  }
  return groups;
}

function copyGroup(target: EditDraft, source: EditDraft, group: EditMergeGroup) {
  if (group === "time")
    return {
      ...target,
      precision: source.precision,
      happenedOn: source.happenedOn,
      happenedLocal: source.happenedLocal,
    };
  return { ...target, [group]: source[group] };
}

export function rebaseDraft(
  base: EditDraft,
  draft: EditDraft,
  latest: EditDraft,
  serverFields: Iterable<string>,
) {
  const local = changedGroups(base, draft);
  const server = remoteGroups(serverFields);
  const overlaps = [...local].filter((group) => server.has(group));
  let rebased = { ...latest, reason: draft.reason };
  for (const group of local)
    if (!server.has(group)) rebased = copyGroup(rebased, draft, group);
  return { draft: rebased, overlaps };
}

export function applyConflictChoice(
  current: EditDraft,
  latest: EditDraft,
  mine: EditDraft,
  group: EditMergeGroup,
  choice: "current" | "mine",
) {
  return copyGroup(current, choice === "mine" ? mine : latest, group);
}

export function changedSnapshotFields(
  before: MomentSnapshot,
  after: MomentSnapshot,
): SnapshotField[] {
  return (Object.keys(before) as SnapshotField[]).filter(
    (field) => !same(before[field], after[field]),
  );
}

export function versionProvenance(
  version: number,
  capturedAt: string,
  capturedBy: string,
  revisions: {
    revision: number;
    editedAt: string;
    editedBy: { label: string };
    changedFields: string[];
    reason: string | null;
  }[],
) {
  if (version === 1)
    return {
      source: "记下",
      at: capturedAt,
      author: capturedBy,
      changedFields: [] as string[],
      reason: null as string | null,
    };
  const sourceRevision = revisions.find((item) => item.revision === version - 1);
  if (!sourceRevision)
    return {
      source: "来源记录缺失",
      at: capturedAt,
      author: null,
      changedFields: [] as string[],
      reason: null,
    };
  return {
    source: `第 ${version - 1} 次修订`,
    at: sourceRevision.editedAt,
    author: sourceRevision.editedBy.label,
    changedFields: sourceRevision.changedFields,
    reason: sourceRevision.reason,
  };
}
