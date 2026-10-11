export const statusSql = `CASE WHEN m.archived_at IS NOT NULL THEN 'archived' WHEN m.latest_resolution='let_go' THEN 'settled' WHEN m.next_review_on IS NOT NULL AND m.next_review_on<=@today THEN 'due' WHEN @now<m.editable_until THEN 'fresh' WHEN m.reflection_count>0 THEN 'reflected' ELSE 'cooling' END`;
export function momentStatus(
  m: {
    archived_at: number | null;
    latest_resolution: string | null;
    next_review_on: string | null;
    editable_until: number;
    reflection_count: number;
  },
  now: number,
  today: string,
) {
  if (m.archived_at !== null) return "archived";
  if (m.latest_resolution === "let_go") return "settled";
  if (m.next_review_on !== null && m.next_review_on <= today) return "due";
  if (now < m.editable_until) return "fresh";
  return m.reflection_count > 0 ? "reflected" : "cooling";
}
