export function Home() {
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
      </div>
    </div>
  );
}
