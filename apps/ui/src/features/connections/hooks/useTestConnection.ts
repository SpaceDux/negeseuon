import { useState } from "react";
import { client } from "@/renderer";

interface TestConnectionResult {
  success: boolean;
  connected: boolean;
  message: string;
  error?: string;
}

export function useTestConnection() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestConnectionResult | null>(null);

  const testConnection = async (config: {
    bootstrapBrokers: string[];
    timeout?: number;
    sasl?: {
      mechanism: "PLAIN" | "SCRAM-SHA-512" | "SCRAM-SHA-256" | "OAUTHBEARER";
      username?: string;
      password?: string;
      token?: string;
    };
  }) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await client.connections.test.mutate({
        type: "kafka",
        config,
      });

      console.log(response);

      setResult(response);
      return response;
    } catch (error) {
      const errorResult: TestConnectionResult = {
        success: false,
        connected: false,
        message:
          error instanceof Error ? error.message : "Connection test failed",
        error: error instanceof Error ? error.message : String(error),
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    testConnection,
    isLoading,
    result,
  };
}
