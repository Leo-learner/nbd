import { ApiError } from "./errors.js";

export async function deleteStagedLessonIfPresent(
  id: string,
  remove: (id: string) => Promise<unknown>,
): Promise<void> {
  try {
    await remove(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return;
    throw error;
  }
}

export type ReflectionStatusCopyKind =
  | "archived"
  | "settled"
  | "fresh"
  | "reflected";

export function reflectionStatusCopyKind(input: {
  originalStatus: string;
  resolution: string;
  latestResolution: string | null;
  changesLatestResolution: boolean;
  editableUntil: number;
  now: number;
}): ReflectionStatusCopyKind {
  if (input.originalStatus === "archived") return "archived";
  const resultingResolution = input.changesLatestResolution
    ? input.resolution
    : input.latestResolution;
  if (resultingResolution === "let_go") return "settled";
  return input.now < input.editableUntil ? "fresh" : "reflected";
}
