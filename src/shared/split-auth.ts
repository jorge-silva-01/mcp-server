import type { AuthContext } from "./auth.schema.js";

export function splitAuth<T extends Record<string, unknown>>(
  input: T
): {
  __auth: AuthContext | undefined;
  args: Omit<T, "__auth">;
} {
  const { __auth, ...rest } = input as T & { __auth?: AuthContext };
  return { __auth, args: rest as Omit<T, "__auth"> };
}
