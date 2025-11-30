import { client } from "@renderer/renderer";

// Directly return the client - TypeScript should infer the type from the import
// Since AppRouter is now in the same package, the types should resolve properly
export function useTRPCClient() {
  return { client };
}
