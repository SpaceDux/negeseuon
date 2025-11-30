import { client } from "@/renderer";

interface TestConnectionResult {
  success: boolean;
  connected: boolean;
  message: string;
  error?: string;
}

export function useTestConnection() {
  const testConnection = async (config) => {
    try {
      const response = await client.connections.test.mutate({
        type: "kafka",
        config,
      });

      return response;
    } catch (error) {
      const errorResult: TestConnectionResult = {
        success: false,
        connected: false,
        message:
          error instanceof Error ? error.message : "Connection test failed",
        error: error instanceof Error ? error.message : String(error),
      };
      return errorResult;
  };

  return {
    testConnection,
  };
}
