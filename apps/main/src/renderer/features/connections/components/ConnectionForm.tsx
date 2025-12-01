import { useForm } from "react-hook-form";
import { useState } from "react";
import { client } from "@renderer/renderer";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@renderer/libs/shadcn/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@renderer/libs/shadcn/components/ui/card";
import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { Input } from "@renderer/libs/shadcn/components/ui/input";
import { Textarea } from "@renderer/libs/shadcn/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/libs/shadcn/components/ui/select";
import { Spinner } from "@renderer/libs/shadcn/components/ui/spinner";
import type { ConnectorConfiguration } from "@negeseuon/schemas";
import type { KafkaConfiguration } from "@negeseuon/schemas";

interface ConnectionFormProps {
  initialData?: ConnectorConfiguration;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormValues {
  name: string;
  description: string;
  type: "kafka";
  bootstrapBrokers: string;
  timeout?: number;
  saslMechanism?: "PLAIN" | "SCRAM-SHA-256" | "SCRAM-SHA-512" | "OAUTHBEARER";
  saslUsername?: string;
  saslPassword?: string;
  saslToken?: string;
}

export function ConnectionForm({
  initialData,
  onSuccess,
  onCancel,
}: ConnectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Parse initial data if editing
  const getInitialValues = (): FormValues => {
    if (initialData) {
      const config = initialData.config as KafkaConfiguration;
      return {
        name: initialData.name,
        description: initialData.description,
        type: initialData.type,
        bootstrapBrokers: config.bootstrapBrokers.join(","),
        timeout: config.timeout,
        saslMechanism: config.sasl?.mechanism,
        saslUsername: config.sasl?.username,
        saslPassword: config.sasl?.password,
        saslToken: config.sasl?.token,
      };
    }
    return {
      name: "",
      description: "",
      type: "kafka",
      bootstrapBrokers: "",
      timeout: undefined,
      saslMechanism: undefined,
      saslUsername: undefined,
      saslPassword: undefined,
      saslToken: undefined,
    };
  };

  const form = useForm<FormValues>({
    defaultValues: getInitialValues(),
  });

  const saslMechanism = form.watch("saslMechanism");

  const buildKafkaConfig = (values: FormValues): KafkaConfiguration => {
    const config: KafkaConfiguration = {
      bootstrapBrokers: values.bootstrapBrokers
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean),
    };

    if (values.timeout) {
      config.timeout = values.timeout;
    }

    if (values.saslMechanism) {
      config.sasl = {
        mechanism: values.saslMechanism,
      };

      if (values.saslMechanism === "OAUTHBEARER" && values.saslToken) {
        config.sasl.token = values.saslToken;
      } else if (
        values.saslMechanism !== "OAUTHBEARER" &&
        values.saslUsername &&
        values.saslPassword
      ) {
        config.sasl.username = values.saslUsername;
        config.sasl.password = values.saslPassword;
      }
    }

    return config;
  };

  const handleTest = async (values: FormValues) => {
    setIsTesting(true);
    try {
      const kafkaConfig = buildKafkaConfig(values);

      const result = await client.connections.test.mutate({
        type: "kafka",
        config: {
          name: values.name,
          description: values.description,
          type: "kafka",
          config: kafkaConfig,
          connected: false,
        },
      });

      if (result.success) {
        toast.success("Connection Test Successful", {
          description: result.message,
        });
      } else {
        toast.error("Connection Test Failed", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Connection Test Failed", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const kafkaConfig = buildKafkaConfig(values);

      const connectionData: ConnectorConfiguration = {
        ...(initialData?.id && { id: initialData.id }),
        name: values.name,
        description: values.description,
        type: "kafka",
        config: kafkaConfig,
        connected: false,
      };

      const result = await client.connections.upsert.mutate(connectionData);

      if (result.success) {
        toast.success(
          initialData?.id ? "Connection Updated" : "Connection Created",
          {
            description: result.message,
          }
        );
        onSuccess?.();
      } else {
        toast.error("Failed to Save Connection", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Failed to Save Connection", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Details</CardTitle>
            <CardDescription>
              Configure the basic connection information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: "Connection name is required",
                minLength: {
                  value: 1,
                  message: "Connection name must be at least 1 character",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Kafka Cluster" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify this connection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{
                required: "Description is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Production Kafka cluster for event streaming"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of this connection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kafka Configuration</CardTitle>
            <CardDescription>
              Configure the Kafka broker connection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="bootstrapBrokers"
              rules={{
                required: "Bootstrap brokers are required",
                validate: (value) => {
                  const brokers = value
                    .split(",")
                    .map((b) => b.trim())
                    .filter(Boolean);
                  if (brokers.length === 0) {
                    return "At least one broker is required";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bootstrap Brokers</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="localhost:9092,broker2:9092"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of Kafka broker addresses (host:port)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeout"
              rules={{
                validate: (value) => {
                  if (value !== undefined && (isNaN(value) || value <= 0)) {
                    return "Timeout must be a positive number";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeout (seconds)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="30"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Connection timeout in seconds (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication (SASL)</CardTitle>
            <CardDescription>
              Configure SASL authentication if required
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="saslMechanism"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SASL Mechanism</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select SASL mechanism" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="PLAIN">PLAIN</SelectItem>
                      <SelectItem value="SCRAM-SHA-256">
                        SCRAM-SHA-256
                      </SelectItem>
                      <SelectItem value="SCRAM-SHA-512">
                        SCRAM-SHA-512
                      </SelectItem>
                      <SelectItem value="OAUTHBEARER">OAUTHBEARER</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the SASL authentication mechanism
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {saslMechanism === "OAUTHBEARER" && (
              <FormField
                control={form.control}
                name="saslToken"
                rules={{
                  required:
                    saslMechanism === "OAUTHBEARER"
                      ? "OAuth token is required"
                      : false,
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OAuth Token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter OAuth token"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      OAuth bearer token for authentication
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {saslMechanism && (
              <>
                <FormField
                  control={form.control}
                  name="saslUsername"
                  rules={{
                    required:
                      saslMechanism && saslMechanism !== "OAUTHBEARER"
                        ? "Username is required"
                        : false,
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormDescription>
                        SASL username for authentication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="saslPassword"
                  rules={{
                    required:
                      saslMechanism && saslMechanism !== "OAUTHBEARER"
                        ? "Password is required"
                        : false,
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        SASL password for authentication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isTesting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={form.handleSubmit(handleTest)}
            disabled={isSubmitting || isTesting}
          >
            {isTesting ? (
              <>
                <Spinner className="mr-2" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
          <Button type="submit" disabled={isSubmitting || isTesting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                {initialData?.id ? "Updating..." : "Creating..."}
              </>
            ) : initialData?.id ? (
              "Update Connection"
            ) : (
              "Create Connection"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
