export interface Principal {
  userId: string;
  kind: "owner" | "agent_key" | "oauth_app" | "system";
  id: string | null;
  label: string;
  scopes: string[];
}
export const ownerPrincipal = (user: {
  id: string;
  display_name: string;
}): Principal => ({
  userId: user.id,
  kind: "owner",
  id: null,
  label: user.display_name,
  scopes: ["read", "write"],
});
