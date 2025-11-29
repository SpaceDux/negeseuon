import { useTestConnection } from "@/features/connections/hooks/useTestConnection";
import { Button } from "@/libs/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/libs/shadcn/components/ui/card";

export function Home() {
  const { testConnection, isLoading, result } = useTestConnection();

  const handleTestConnection = () => {
    testConnection({
      bootstrapBrokers: ["localhost:9092"],
      sasl: {
        mechanism: "PLAIN",
        username: "admin",
        password: "admin-secret",
      },
    });
  };

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold">Welcome to negeseuon</h1>
          <p className="text-muted-foreground">
            A Kafka GUI for interacting with Kafka and other messaging
            platforms.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Connection</CardTitle>
            <CardDescription>
              Test the connection to Kafka with dummy credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">Kafka Configuration:</p>
              <div className="rounded-md bg-muted p-3 text-sm font-mono">
                <div>Bootstrap Brokers: localhost:9092</div>
                <div>SASL Mechanism: PLAIN</div>
                <div>Username: admin</div>
                <div>Password: admin-secret</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Testing Connection..." : "Test Connection"}
            </Button>

            {result && (
              <div
                className={`w-full rounded-md border p-3 text-sm ${
                  result.success && result.connected
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-red-500 bg-red-50 dark:bg-red-950/20"
                }`}
              >
                <p
                  className={`font-medium ${
                    result.success && result.connected
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {result.success && result.connected
                    ? "✓ Success"
                    : "✗ Failed"}
                </p>
                <p className="mt-1 text-muted-foreground">{result.message}</p>
                {result.error && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Error: {result.error}
                  </p>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
